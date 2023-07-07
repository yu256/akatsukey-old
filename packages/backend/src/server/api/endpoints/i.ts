import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';

export const meta = {
	tags: ['account'],

	requireCredential: true,

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'MeDetailed',
	},

	// errors: {
	// 	userIsDeleted: {
	// 		message: 'User is deleted.',
	// 		code: 'USER_IS_DELETED',
	// 		id: 'e5b3b9f0-2b8f-4b9f-9c1f-8c5c1b2e1b1a',
	// 		kind: 'permission',
	// 	},
	// },
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private userEntityService: UserEntityService,
	) {
		super(meta, paramDef, async (_ps, user, token) => {
			const isSecure = token == null;

			// ここで渡ってきている user はキャッシュされていて古い可能性もあるので id だけ渡す
			return await this.userEntityService.pack<true, true>(user.id, user, {
				detail: true,
				includeSecrets: isSecure,
			});
		});
	}
}
