import { defaultStore } from '@/store';
import { alert as miAlert } from '@/os';

export type Error = {
	Error: {
		error: string;
	}
}

export async function fetchFriends(): Promise<Friend[] | undefined> {
	type Success = {
		Success: {
			friends: Friend[];
		}
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'friends', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error.error,
		});
		return;
	}

	return res.Success.friends;
}

export async function fetchInstance(id: string): Promise<Instance | undefined> {
	type Success = {
		Success: {
			instance: Instance;
		}
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'instance', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + id,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error.error,
		});
		return;
	}

	return res.Success.instance;
}

export async function fetchUser(user: string): Promise<User | undefined> {
	type Success = {
		Success: {
			user: User;
		}
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'user', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + user,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error.error,
		});
		return;
	}

	return res.Success.user;
}

export async function searchUser(query: string): Promise<HitUsers | undefined> {
	type Success = {
		Success: {
			users: HitUsers;
		}
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'search_user', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + query,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error.error,
		});
		return;
	}

	return res.Success.users;
}

export type Friend = {
	currentAvatarThumbnailImageUrl: string;
	id: string;
	location: string;
	status: 'join me' | 'active' | 'ask me' | 'busy';
};

export type Instance = {
	ownerId?: string;
	userCount: number;
	name: string;
	description: string;
	thumbnailImageUrl: string;
};

export type User = {
	bio: string;
	bioLinks: string[];
	currentAvatarThumbnailImageUrl: string;
	displayName: string;
	last_activity?: string;
	location: string;
	status: 'join me' | 'active' | 'ask me' | 'busy';
	statusDescription?: string;
};

export type HitUsers = Array<Pick<User, 'currentAvatarThumbnailImageUrl' | 'displayName' | 'statusDescription'> & {
	isFriend: boolean;
	id: string;
}>;
