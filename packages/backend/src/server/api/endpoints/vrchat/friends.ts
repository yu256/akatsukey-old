import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { ApiError } from '../../error.js';

export const meta = {
	requireCredential: true,

	tags: ['meta'],

	res: {
		type: 'array',
		optional: false, nullable: true,
	},

	errors: {
		invalidToken: {
			message: 'Invalid Token.',
			code: 'INVALID_TOKEN',
			id: '',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		token: { type: 'string', nullable: true },
	},
	required: [],
} as const;

interface Friend {
	bio: string;
	currentAvatarImageUrl: string;
	currentAvatarThumbnailImageUrl: string;
	developerType: string;
	displayName: string;
	fallbackAvatar: string;
	id: string;
	isFriend: boolean;
	last_platform: string;
	profilePicOverride: string;
	status: string;
	statusDescription: string;
	tags: string[];
	userIcon: string;
	location: string;
	friendKey: string;
}

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor() {
		super(meta, paramDef, async (ps) => {
			const friends: Friend[] = await fetch('https://api.vrchat.cloud/api/1/auth/user/friends?offline=false', {
				method: 'GET',
				headers: {
					'User-Agent': 'vrc-ts',
					Cookie: 'auth=' + ps.token,
				},
			}).then((res) => res.json());

			if (!Array.isArray(friends)) throw new ApiError(meta.errors.invalidToken);

			const trimmedFriends = friends.filter(friend => friend.location !== 'offline').map(friend => {
				console.log(friend);
				const { id, status, location, currentAvatarThumbnailImageUrl } = friend;
				return {
					id,
					status,
					location,
					currentAvatarThumbnailImageUrl,
				};
			});

			return trimmedFriends;
		});
	}
}
