import { defaultStore } from '@/store';
import { api } from '@/os';

export async function getFriends(): Promise<GetFriendsRes> {
	return api('vrchat', {
		requestType: 'getFriends',
		token: defaultStore.state.VRChatToken,
	});
}

export async function fetchToken(user: string, password: string): Promise<FetchTokenRes> {
	return api('vrchat', {
		requestType: 'fetchToken',
		user,
		password,
	});
}

interface FetchTokenRes {
	response: Response;
}

interface Response {
	requiresTwoFactorAuth: string;
	authToken: string;
}

interface GetFriendsRes {
	response: Friend[];
}

export interface Friend {
	currentAvatarThumbnailImageUrl: string;
	id: string;
	location: string;
	status: string;
}
