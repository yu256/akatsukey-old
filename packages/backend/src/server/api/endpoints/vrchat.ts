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

async function fetchToken(user: string, password: string): Promise<JSON> {
	const res = await fetch('https://api.vrchat.cloud/api/1/auth/user', {
		headers: {
			Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
			UserAgent: 'vrc-ts',
		},
	});

	const resp = await res.json();

	resp.authToken = res.headers.get('set-cookie')?.split(';')[0].split('=')[1];

	return resp;
}

export const paramDef = {
	type: 'object',
	properties: {
		user: { type: 'string', nullable: true },
		password: { type: 'string', nullable: true },
	},
	required: [],
} as const;

@Injectable() // eslint-disable-next-line import/no-default-export
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor() {
		super(meta, paramDef, async (ps) => fetchToken(ps.user as string, ps.password as string));
	}
}
