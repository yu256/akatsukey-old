import { apLogger } from '../../logger.js';
import { createDeleteAccountJob } from '@/queue/index.js';
import { CacheableRemoteUser } from '@/models/entities/user.js';
import { Users } from '@/models/index.js';

const logger = apLogger;

export async function deleteActor(actor: CacheableRemoteUser, uri: string): Promise<string> {
	logger.info(`Deleting the Actor: ${uri}`);

	if (actor.uri !== uri) {
		return `skip: delete actor ${actor.uri} !== ${uri}`;
	}

	const user = await Users.findOneBy({ id: actor.id });
	if (user == null) {
		return `skip: actor not found`;
	} else if (user.isDeleted) {
		return `skip: already deleted`;
	}

	const job = await createDeleteAccountJob(actor);

	await Users.update(actor.id, {
		isDeleted: true,
	});

	return `ok: queued ${job.name} ${job.id}`;
}
