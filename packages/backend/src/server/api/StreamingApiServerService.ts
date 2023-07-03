import { EventEmitter } from 'events';
import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import * as WebSocket from 'ws';
import { DI } from '@/di-symbols.js';
import type { UsersRepository, AccessToken } from '@/models/index.js';
import type { Config } from '@/config.js';
import { NoteReadService } from '@/core/NoteReadService.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { NotificationService } from '@/core/NotificationService.js';
import { bindThis } from '@/decorators.js';
import { CacheService } from '@/core/CacheService.js';
import { LocalUser } from '@/models/entities/User.js';
import { AuthenticateService, AuthenticationError } from './AuthenticateService.js';
import MainStreamConnection from './stream/index.js';
import { ChannelsService } from './stream/ChannelsService.js';
import type * as http from 'node:http';

@Injectable()
export class StreamingApiServerService {
	#wss: WebSocket.WebSocketServer;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redisForSub)
		private redisForSub: Redis.Redis,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private cacheService: CacheService,
		private noteReadService: NoteReadService,
		private authenticateService: AuthenticateService,
		private channelsService: ChannelsService,
		private notificationService: NotificationService,
	) {
	}

	@bindThis
	public attach(server: http.Server): void {
		this.#wss = new WebSocket.WebSocketServer({
			noServer: true,
		});

		server.on('upgrade', async (request, socket, head) => {
			if (request.url == null) {
				socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
				socket.destroy();
				return;
			}

			const q = new URL(request.url, `http://${request.headers.host}`).searchParams;

			let user: LocalUser | null = null;
			let app: AccessToken | null = null;

			// https://datatracker.ietf.org/doc/html/rfc6750.html#section-2.1
			// Note that the standard WHATWG WebSocket API does not support setting any headers,
			// but non-browser apps may still be able to set it.
			const token = request.headers.authorization?.startsWith('Bearer ')
				? request.headers.authorization.slice(7)
				: q.get('i');

			try {
				[user, app] = await this.authenticateService.authenticate(token);
			} catch (e) {
				if (e instanceof AuthenticationError) {
					socket.write([
						'HTTP/1.1 401 Unauthorized',
						'WWW-Authenticate: Bearer realm="Misskey", error="invalid_token", error_description="Failed to authenticate"',
					].join('\r\n') + '\r\n\r\n');
				} else {
					socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
				}
				socket.destroy();
				return;
			}

			if (user?.isSuspended) {
				socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
				socket.destroy();
				return;
			}

			const stream = new MainStreamConnection(
				this.channelsService,
				this.noteReadService,
				this.notificationService,
				this.cacheService,
				user, app,
			);

			await stream.init();

			this.#wss.handleUpgrade(request, socket, head, (ws) => {
				this.#wss.emit('connection', ws, request, {
					stream, user, app,
				});
			});
		});

		const globalEv = new EventEmitter();

		this.redisForSub.on('message', (_: string, data: string) => {
			const parsed = JSON.parse(data);
			globalEv.emit('message', parsed);
		});

		this.#wss.on('connection', async (connection: WebSocket.WebSocket, request: http.IncomingMessage, ctx: {
			stream: MainStreamConnection,
			user: LocalUser | null;
			app: AccessToken | null
		}) => {
			const { stream, user, app } = ctx;

			const ev = new EventEmitter();

			function onRedisMessage(data: any): void {
				ev.emit(data.channel, data.message);
			}

			globalEv.on('message', onRedisMessage);

			await stream.listen(ev, connection);

			const intervalId = user ? setInterval(() => {
				this.usersRepository.update(user.id, {
					lastActiveDate: new Date(),
				});
			}, 1000 * 60 * 5) : null;
			if (user) {
				this.usersRepository.update(user.id, {
					lastActiveDate: new Date(),
				});
			}

			connection.once('close', () => {
				ev.removeAllListeners();
				stream.dispose();
				globalEv.off('message', onRedisMessage);
				if (intervalId) clearInterval(intervalId);
			});

			connection.on('message', async (data) => {
				if (data.toString() === 'ping') {
					connection.send('pong');
				}
			});
		});
	}

	@bindThis
	public detach(): Promise<void> {
		return new Promise((resolve) => {
			this.#wss.close(() => resolve());
		});
	}
}
