import { defaultStore } from '@/store';
import { alert as miAlert } from '@/os';

export type Error = {
	Error: string;
}

export async function fetchFriends(): Promise<Friend[] | undefined> {
	type Success = {
		Success: Friend[];
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'friends', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
}

export async function fetchInstance(id: string): Promise<Instance | undefined> {
	type Success = {
		Success: Instance;
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'instance', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + id,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
}

export async function fetchUser(user: string): Promise<User | undefined> {
	type Success = {
		Success: User;
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'user', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + user,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
}

export async function searchUser(query: string): Promise<HitUsers | undefined> {
	type Success = {
		Success: HitUsers;
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'search_user', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + query,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
}

export async function friendRequest(id: string, isPost: boolean): Promise<boolean> {
	type Success = {
		Success: unknown; // 空
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'friend_request', {
		method: isPost ? 'POST' : 'DELETE',
		body: defaultStore.state.VRChatAuth + ':' + id,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return false;
	}

	return true;
}

export async function friendStatus(id: string): Promise<Status | undefined> {
	type Success = {
		Success: Status;
	};

	const res: Success | Error = await fetch(defaultStore.state.VRChatURL + 'friend_status', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + id,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
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
	rank: string;
};

export type HitUsers = Array<Pick<User, 'currentAvatarThumbnailImageUrl' | 'displayName' | 'statusDescription'> & {
	isFriend: boolean;
	id: string;
}>;

export type Status = {
	outgoingRequest: boolean;
	incomingRequest: boolean;
};
