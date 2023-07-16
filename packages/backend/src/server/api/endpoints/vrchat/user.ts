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
		user: { type: 'string', nullable: true },
	},
	required: [],
} as const;

interface User {
	bio: string;
	bioLinks: string[];
	currentAvatarThumbnailImageUrl: string;
	displayName: string;
	last_activity: string;
	location: string;
	status: string;
	statusDescription: string;
}

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor() {
		super(meta, paramDef, async (ps) => {
			const data: User = await fetch(`https://api.vrchat.cloud/api/1/users/${ps.user}`, {
				method: 'GET',
				headers: {
					'User-Agent': 'vrc-ts',
					Cookie: 'auth=' + ps.token,
				},
			}).then((res) => res.json());

			const { bio, bioLinks, currentAvatarThumbnailImageUrl, displayName, last_activity, location, status, statusDescription } = data;

			return { bio, bioLinks, currentAvatarThumbnailImageUrl, displayName, last_activity, location, status, statusDescription };
		});
	}
}
