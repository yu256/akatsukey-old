import { APIError } from 'misskey-js/built/api';
import { defaultStore } from '@/store';
import { api } from '@/os';

export async function getFriends(): Promise<Friend[] | APIError> {
	return api('vrchat/friends', {
		token: defaultStore.state.VRChatToken,
	});
}

export async function fetchToken(user: string, password: string): Promise<FetchTokenRes> {
	return api('vrchat', {
		user,
		password,
	});
}

export interface FetchTokenRes {
	requiresTwoFactorAuth: string;
	authToken: string;
}

export interface Friend {
	currentAvatarThumbnailImageUrl: string;
	id: string;
	location: string;
	status: string;
}
