import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';

export const meta = {
	requireCredential: true,

	tags: ['meta'],

	res: {
		type: 'object',
		optional: false, nullable: true,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		token: { type: 'string', nullable: true },
		id: { type: 'string', nullable: true },
	},
	required: [],
} as const;

interface Platforms {
	standalonewindows: number;
	android: number;
}

interface World {
	id: string;
	tags: string[];
	name: string;
	description: string;
	authorId: string;
	authorName: string;
	releaseStatus: string;
	imageUrl: string;
	thumbnailImageUrl: string;
	capacity: number;
	version: number;
	created_at: string;
	updated_at: string;
}

interface InstanceData {
	id: string;
	location: string;
	instanceId: string;
	name: string;
	worldId: string;
	type: string;
	ownerId: string;
	tags: string[];
	active: boolean;
	full: boolean;
	n_users: number;
	hasCapacityForYou: boolean;
	capacity: number;
	recommendedCapacity: number;
	userCount: number;
	queueEnabled: boolean;
	platforms: Platforms;
	gameServerVersion: number;
	secureName: string;
	shortName: null;
	world: World;
	clientNumber: string;
	photonRegion: string;
	region: string;
	canRequestInvite: boolean;
	permanent: boolean;
	hidden: string;
	strict: boolean;
}

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor() {
		super(meta, paramDef, async (ps) => {
			const data: InstanceData = await fetch(`https://api.vrchat.cloud/api/1/instances/${ps.id}`, {
				method: 'GET',
				headers: {
					'User-Agent': 'vrc-ts',
					Cookie: 'auth=' + ps.token,
				},
			}).then((res) => res.json());

			const { ownerId, userCount } = data;

			const { name, description, thumbnailImageUrl } = data.world;

			return { ownerId, userCount, name, description, thumbnailImageUrl };
		});
	}
}
