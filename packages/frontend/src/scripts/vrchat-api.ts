import { defaultStore } from '@/store';
import { api } from '@/os';

export async function fetchFriends(): Promise<Friend[]> {
	return api('vrchat/friends', {
		token: defaultStore.state.VRChatToken,
	});
}

export async function fetchInstance(id: string): Promise<Instance> {
	return api('vrchat/instance', {
		token: defaultStore.state.VRChatToken,
		id,
	});
}

export async function fetchUser(user: string): Promise<User> {
	return api('vrchat/user', {
		token: defaultStore.state.VRChatToken,
		user,
	});
}

export type Friend = {
	currentAvatarThumbnailImageUrl: string;
	id: string;
	location: string;
	status: string;
}

export type Instance = {
	ownerId: string;
	userCount: number;
	name: string;
	description: string;
	thumbnailImageUrl: string;
}

export type User = {
	bio: string;
	bioLinks: string[];
	currentAvatarThumbnailImageUrl: string;
	displayName: string;
	last_activity: string;
	location: string;
	status: string;
	statusDescription?: string;
}
