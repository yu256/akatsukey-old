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
		twofactor: { type: 'string', nullable: true },
	},
	required: [],
} as const;

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor() {
		super(meta, paramDef, async (ps) => {
			const authtoken = ps.token as string;
			const twofactor = ps.twofactor as string;

			const res = await fetch('https://api.vrchat.cloud/api/1/auth/twofactorauth/emailotp/verify', {
				method: 'POST',
				headers: {
					'User-Agent': 'vrc-ts',
					'Content-Type': 'application/json',
					'Cookie': 'auth=' + authtoken,
				},
				body: JSON.stringify({
					code: twofactor,
				}),
			});
			return res.text();
		});
	}
}
