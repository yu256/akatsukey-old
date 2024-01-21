/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import CRC32 from 'crc-32';
import { ModuleRef } from '@nestjs/core';
import * as Reversi from 'misskey-reversi';
import { IsNull } from 'typeorm';
import type {
	MiReversiGame,
	ReversiGamesRepository,
	UsersRepository,
} from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import { MetaService } from '@/core/MetaService.js';
import { CacheService } from '@/core/CacheService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import type { GlobalEvents } from '@/core/GlobalEventService.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { IdService } from '@/core/IdService.js';
import type { Packed } from '@/misc/json-schema.js';
import { NotificationService } from '@/core/NotificationService.js';
import { Serialized } from '@/types.js';
import { ReversiGameEntityService } from './entities/ReversiGameEntityService.js';
import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

const MATCHING_TIMEOUT_MS = 1000 * 15; // 15sec

@Injectable()
export class ReversiService implements OnApplicationShutdown, OnModuleInit {
	private notificationService: NotificationService;

	constructor(
		private moduleRef: ModuleRef,

		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.reversiGamesRepository)
		private reversiGamesRepository: ReversiGamesRepository,

		private cacheService: CacheService,
		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
		private reversiGameEntityService: ReversiGameEntityService,
		private idService: IdService,
	) {
	}

	async onModuleInit() {
		this.notificationService = this.moduleRef.get(NotificationService.name);
	}

	@bindThis
	private async cacheGame(game: MiReversiGame) {
		await this.redisClient.setex(`reversi:game:cache:${game.id}`, 60 * 3, JSON.stringify(game));
	}

	@bindThis
	private async deleteGameCache(gameId: MiReversiGame['id']) {
		await this.redisClient.del(`reversi:game:cache:${gameId}`);
	}

	@bindThis
	public async matchSpecificUser(me: MiUser, targetUser: MiUser): Promise<MiReversiGame | null> {
		if (targetUser.id === me.id) {
			throw new Error('You cannot match yourself.');
		}

		const invitations = await this.redisClient.zrange(
			`reversi:matchSpecific:${me.id}`,
			Date.now() - MATCHING_TIMEOUT_MS,
			'+inf',
			'BYSCORE');

		if (invitations.includes(targetUser.id)) {
			await this.redisClient.zrem(`reversi:matchSpecific:${me.id}`, targetUser.id);

			const game = await this.reversiGamesRepository.insert({
				id: this.idService.gen(),
				user1Id: targetUser.id,
				user2Id: me.id,
				user1Ready: false,
				user2Ready: false,
				isStarted: false,
				isEnded: false,
				logs: [],
				map: Reversi.maps.eighteight.data,
				bw: 'random',
				isLlotheo: false,
			}).then(x => this.reversiGamesRepository.findOneByOrFail(x.identifiers[0]));
			this.cacheGame(game);

			const packed = await this.reversiGameEntityService.packDetail(game, { id: targetUser.id });
			this.globalEventService.publishReversiStream(targetUser.id, 'matched', { game: packed });

			return game;
		} else {
			this.redisClient.zadd(`reversi:matchSpecific:${targetUser.id}`, Date.now(), me.id);

			this.globalEventService.publishReversiStream(targetUser.id, 'invited', {
				user: await this.userEntityService.pack(me, targetUser),
			});

			return null;
		}
	}

	@bindThis
	public async matchAnyUser(me: MiUser): Promise<MiReversiGame | null> {
		//#region まず自分宛ての招待を探す
		const invitations = await this.redisClient.zrange(
			`reversi:matchSpecific:${me.id}`,
			Date.now() - MATCHING_TIMEOUT_MS,
			'+inf',
			'BYSCORE');

		if (invitations.length > 0) {
			const invitorId = invitations[Math.floor(Math.random() * invitations.length)];
			await this.redisClient.zrem(`reversi:matchSpecific:${me.id}`, invitorId);

			const game = await this.reversiGamesRepository.insert({
				id: this.idService.gen(),
				user1Id: invitorId,
				user2Id: me.id,
				user1Ready: false,
				user2Ready: false,
				isStarted: false,
				isEnded: false,
				logs: [],
				map: Reversi.maps.eighteight.data,
				bw: 'random',
				isLlotheo: false,
			}).then(x => this.reversiGamesRepository.findOneByOrFail(x.identifiers[0]));
			this.cacheGame(game);

			const packed = await this.reversiGameEntityService.packDetail(game, { id: invitorId });
			this.globalEventService.publishReversiStream(invitorId, 'matched', { game: packed });

			return game;
		}
		//#endregion

		const matchings = await this.redisClient.zrange(
			'reversi:matchAny',
			Date.now() - MATCHING_TIMEOUT_MS,
			'+inf',
			'BYSCORE');

		const userIds = matchings.filter(id => id !== me.id);

		if (userIds.length > 0) {
			// pick random
			const matchedUserId = userIds[Math.floor(Math.random() * userIds.length)];

			await this.redisClient.zrem('reversi:matchAny', me.id, matchedUserId);

			const game = await this.reversiGamesRepository.insert({
				id: this.idService.gen(),
				user1Id: matchedUserId,
				user2Id: me.id,
				user1Ready: false,
				user2Ready: false,
				isStarted: false,
				isEnded: false,
				logs: [],
				map: Reversi.maps.eighteight.data,
				bw: 'random',
				isLlotheo: false,
			}).then(x => this.reversiGamesRepository.findOneByOrFail(x.identifiers[0]));
			this.cacheGame(game);

			const packed = await this.reversiGameEntityService.packDetail(game, { id: matchedUserId });
			this.globalEventService.publishReversiStream(matchedUserId, 'matched', { game: packed });

			return game;
		} else {
			await this.redisClient.zadd('reversi:matchAny', Date.now(), me.id);
			return null;
		}
	}

	@bindThis
	public async matchSpecificUserCancel(user: MiUser, targetUserId: MiUser['id']) {
		await this.redisClient.zrem(`reversi:matchSpecific:${targetUserId}`, user.id);
	}

	@bindThis
	public async matchAnyUserCancel(user: MiUser) {
		await this.redisClient.zrem('reversi:matchAny', user.id);
	}

	@bindThis
	public async gameReady(gameId: MiReversiGame['id'], user: MiUser, ready: boolean) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (game.isStarted) return;

		let isBothReady = false;

		if (game.user1Id === user.id) {
			const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
				.set({
					user1Ready: ready,
				})
				.where('id = :id', { id: game.id })
				.returning('*')
				.execute()
				.then((response) => response.raw[0]);
			this.cacheGame(updatedGame);

			this.globalEventService.publishReversiGameStream(game.id, 'changeReadyStates', {
				user1: ready,
				user2: updatedGame.user2Ready,
			});

			if (ready && updatedGame.user2Ready) isBothReady = true;
		} else if (game.user2Id === user.id) {
			const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
				.set({
					user2Ready: ready,
				})
				.where('id = :id', { id: game.id })
				.returning('*')
				.execute()
				.then((response) => response.raw[0]);
			this.cacheGame(updatedGame);

			this.globalEventService.publishReversiGameStream(game.id, 'changeReadyStates', {
				user1: updatedGame.user1Ready,
				user2: ready,
			});

			if (ready && updatedGame.user1Ready) isBothReady = true;
		} else {
			return;
		}

		if (isBothReady) {
			// 3秒後、両者readyならゲーム開始
			setTimeout(async () => {
				const freshGame = await this.get(game.id);
				if (freshGame == null || freshGame.isStarted || freshGame.isEnded) return;
				if (!freshGame.user1Ready || !freshGame.user2Ready) return;

				this.startGame(freshGame);
			}, 3000);
		}
	}

	@bindThis
	private async startGame(game: MiReversiGame) {
		let bw: number;
		if (game.bw === 'random') {
			bw = Math.random() > 0.5 ? 1 : 2;
		} else {
			bw = parseInt(game.bw, 10);
		}

		function getRandomMap() {
			const mapCount = Object.entries(Reversi.maps).length;
			const rnd = Math.floor(Math.random() * mapCount);
			return Object.values(Reversi.maps)[rnd].data;
		}

		const map = game.map != null ? game.map : getRandomMap();

		const crc32 = CRC32.str(JSON.stringify(game.logs)).toString();

		const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
			.set({
				startedAt: new Date(),
				isStarted: true,
				black: bw,
				map: map,
				crc32,
			})
			.where('id = :id', { id: game.id })
			.returning('*')
			.execute()
			.then((response) => response.raw[0]);
		this.cacheGame(updatedGame);

		//#region 盤面に最初から石がないなどして始まった瞬間に勝敗が決定する場合があるのでその処理
		const engine = new Reversi.Game(map, {
			isLlotheo: game.isLlotheo,
			canPutEverywhere: game.canPutEverywhere,
			loopedBoard: game.loopedBoard,
		});

		if (engine.isEnded) {
			let winner;
			if (engine.winner === true) {
				winner = bw === 1 ? game.user1Id : game.user2Id;
			} else if (engine.winner === false) {
				winner = bw === 1 ? game.user2Id : game.user1Id;
			} else {
				winner = null;
			}

			const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
				.set({
					isEnded: true,
					endedAt: new Date(),
					winnerId: winner,
				})
				.where('id = :id', { id: game.id })
				.returning('*')
				.execute()
				.then((response) => response.raw[0]);
			this.cacheGame(updatedGame);

			this.globalEventService.publishReversiGameStream(game.id, 'ended', {
				winnerId: winner,
				game: await this.reversiGameEntityService.packDetail(game.id),
			});

			return;
		}
		//#endregion

		this.redisClient.setex(`reversi:game:turnTimer:${game.id}:1`, updatedGame.timeLimitForEachTurn, '');

		this.globalEventService.publishReversiGameStream(game.id, 'started', {
			game: await this.reversiGameEntityService.packDetail(game.id),
		});
	}

	@bindThis
	public async getInvitations(user: MiUser): Promise<MiUser['id'][]> {
		const invitations = await this.redisClient.zrange(
			`reversi:matchSpecific:${user.id}`,
			Date.now() - MATCHING_TIMEOUT_MS,
			'+inf',
			'BYSCORE');
		return invitations;
	}

	@bindThis
	public async updateSettings(gameId: MiReversiGame['id'], user: MiUser, key: string, value: any) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (game.isStarted) return;
		if ((game.user1Id !== user.id) && (game.user2Id !== user.id)) return;
		if ((game.user1Id === user.id) && game.user1Ready) return;
		if ((game.user2Id === user.id) && game.user2Ready) return;

		if (!['map', 'bw', 'isLlotheo', 'canPutEverywhere', 'loopedBoard', 'timeLimitForEachTurn'].includes(key)) return;

		// TODO: より厳格なバリデーション

		const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
			.set({
				[key]: value,
			})
			.where('id = :id', { id: game.id })
			.returning('*')
			.execute()
			.then((response) => response.raw[0]);
		this.cacheGame(updatedGame);

		this.globalEventService.publishReversiGameStream(game.id, 'updateSettings', {
			userId: user.id,
			key: key,
			value: value,
		});
	}

	@bindThis
	public async putStoneToGame(gameId: MiReversiGame['id'], user: MiUser, pos: number, id?: string | null) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (!game.isStarted) return;
		if (game.isEnded) return;
		if ((game.user1Id !== user.id) && (game.user2Id !== user.id)) return;

		const myColor =
			((game.user1Id === user.id) && game.black === 1) || ((game.user2Id === user.id) && game.black === 2)
				? true
				: false;

		const engine = Reversi.Serializer.restoreGame({
			map: game.map,
			isLlotheo: game.isLlotheo,
			canPutEverywhere: game.canPutEverywhere,
			loopedBoard: game.loopedBoard,
			logs: game.logs,
		});

		if (engine.turn !== myColor) return;
		if (!engine.canPut(myColor, pos)) return;

		engine.putStone(pos);

		let winner;
		if (engine.isEnded) {
			if (engine.winner === true) {
				winner = game.black === 1 ? game.user1Id : game.user2Id;
			} else if (engine.winner === false) {
				winner = game.black === 1 ? game.user2Id : game.user1Id;
			} else {
				winner = null;
			}
		}

		const logs = Reversi.Serializer.deserializeLogs(game.logs);

		const log = {
			time: Date.now(),
			player: myColor,
			operation: 'put',
			pos,
		} as const;

		logs.push(log);

		const serializeLogs = Reversi.Serializer.serializeLogs(logs);

		const crc32 = CRC32.str(JSON.stringify(serializeLogs)).toString();

		const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
			.set({
				crc32,
				isEnded: engine.isEnded,
				winnerId: winner,
				logs: serializeLogs,
			})
			.where('id = :id', { id: game.id })
			.returning('*')
			.execute()
			.then((response) => response.raw[0]);
		this.cacheGame(updatedGame);

		this.globalEventService.publishReversiGameStream(game.id, 'log', {
			...log,
			id: id ?? null,
		});

		if (engine.isEnded) {
			this.globalEventService.publishReversiGameStream(game.id, 'ended', {
				winnerId: winner ?? null,
				game: await this.reversiGameEntityService.packDetail(game.id),
			});
		} else {
			this.redisClient.setex(`reversi:game:turnTimer:${game.id}:${engine.turn ? '1' : '0'}`, updatedGame.timeLimitForEachTurn, '');
		}
	}

	@bindThis
	public async surrender(gameId: MiReversiGame['id'], user: MiUser) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (game.isEnded) return;
		if ((game.user1Id !== user.id) && (game.user2Id !== user.id)) return;

		const winnerId = game.user1Id === user.id ? game.user2Id : game.user1Id;

		const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
			.set({
				isEnded: true,
				endedAt: new Date(),
				winnerId: winnerId,
				surrenderedUserId: user.id,
			})
			.where('id = :id', { id: game.id })
			.returning('*')
			.execute()
			.then((response) => response.raw[0]);
		this.cacheGame(updatedGame);

		this.globalEventService.publishReversiGameStream(game.id, 'ended', {
			winnerId: winnerId,
			game: await this.reversiGameEntityService.packDetail(game.id),
		});
	}

	@bindThis
	public async checkTimeout(gameId: MiReversiGame['id']) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (game.isEnded) return;

		const engine = Reversi.Serializer.restoreGame({
			map: game.map,
			isLlotheo: game.isLlotheo,
			canPutEverywhere: game.canPutEverywhere,
			loopedBoard: game.loopedBoard,
			logs: game.logs,
		});

		if (engine.turn == null) return;

		const timer = await this.redisClient.exists(`reversi:game:turnTimer:${game.id}:${engine.turn ? '1' : '0'}`);

		if (timer === 0) {
			const winnerId = engine.turn ? (game.black === 1 ? game.user2Id : game.user1Id) : (game.black === 1 ? game.user1Id : game.user2Id);

			const updatedGame = await this.reversiGamesRepository.createQueryBuilder().update()
				.set({
					isEnded: true,
					endedAt: new Date(),
					winnerId: winnerId,
					timeoutUserId: engine.turn ? (game.black === 1 ? game.user1Id : game.user2Id) : (game.black === 1 ? game.user2Id : game.user1Id),
				})
				.where('id = :id', { id: game.id })
				.returning('*')
				.execute()
				.then((response) => response.raw[0]);
			this.cacheGame(updatedGame);

			this.globalEventService.publishReversiGameStream(game.id, 'ended', {
				winnerId: winnerId,
				game: await this.reversiGameEntityService.packDetail(game.id),
			});
		}
	}

	@bindThis
	public async cancelGame(gameId: MiReversiGame['id'], user: MiUser) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');
		if (game.isStarted) return;
		if ((game.user1Id !== user.id) && (game.user2Id !== user.id)) return;

		await this.reversiGamesRepository.delete(game.id);
		this.deleteGameCache(game.id);

		this.globalEventService.publishReversiGameStream(game.id, 'canceled', {
			userId: user.id,
		});
	}

	@bindThis
	public async get(id: MiReversiGame['id']): Promise<MiReversiGame | null> {
		const cached = await this.redisClient.get(`reversi:game:cache:${id}`);
		if (cached != null) {
			const parsed = JSON.parse(cached) as Serialized<MiReversiGame>;
			return {
				...parsed,
				startedAt: parsed.startedAt != null ? new Date(parsed.startedAt) : null,
				endedAt: parsed.endedAt != null ? new Date(parsed.endedAt) : null,
			};
		} else {
			const game = await this.reversiGamesRepository.findOneBy({ id });
			if (game == null) return null;

			this.cacheGame(game);

			return game;
		}
	}

	@bindThis
	public async checkCrc(gameId: MiReversiGame['id'], crc32: string | number) {
		const game = await this.get(gameId);
		if (game == null) throw new Error('game not found');

		if (crc32.toString() !== game.crc32) {
			return await this.reversiGameEntityService.packDetail(game);
		} else {
			return null;
		}
	}

	@bindThis
	public dispose(): void {
	}

	@bindThis
	public onApplicationShutdown(signal?: string | undefined): void {
		this.dispose();
	}
}
