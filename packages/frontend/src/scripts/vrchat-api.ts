import { defaultStore } from '@/store';
import { alert as miAlert } from '@/os';

type ApiResponse<T> = { Success: T } | { Error: string };

export async function fetchData<T>(url: string, body: string, method = 'POST'): Promise<T | undefined> {
	const res: ApiResponse<T> = await fetch(defaultStore.state.VRChatURL + url, {
		method,
		body,
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

export async function fetchDataReqAuth<T>(url: string, body = '', method?: string): Promise<T | undefined> {
	// eslint-disable-next-line no-param-reassign
	body &&= ':' + body;
	return fetchData<T>(url, defaultStore.state.VRChatAuth + body, method);
}

export async function fetchFriends(): Promise<Friend[] | undefined> {
	return fetchDataReqAuth<Friend[]>('friends');
}

export async function fetchInstance(id: string): Promise<Instance | undefined> {
	return fetchDataReqAuth<Instance>('instance', id);
}

export async function fetchUser(user: string): Promise<User | undefined> {
	return fetchDataReqAuth<User>('user', user);
}

export async function searchUser(query: string): Promise<HitUsers | undefined> {
	return fetchDataReqAuth<HitUsers>('search_user', query);
}

export async function friendRequest(id: string, isPost: boolean): Promise<boolean> {
	const res = await fetchDataReqAuth<boolean>('friend_request', id, isPost ? 'POST' : 'DELETE');
	return !!res;
}

export async function friendStatus(id: string): Promise<Status | undefined> {
	return fetchDataReqAuth<Status>('friend_status', id);
}

export async function fetchWorld(id: string): Promise<World | undefined> {
	return fetchDataReqAuth<World>('world', id);
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

export type World = {
	authorId: string;
	// authorName: string;
	capacity: number;
	created_at: string;
	description: string;
	favorites: number;
	featured: boolean;
	heat: number;
	// id: string;
	imageUrl: string;
	labsPublicationDate: string;
	name: string;
	namespace: string;
	// occupants: number;
	organization: string;
	popularity: number;
	privateOccupants: number;
	publicOccupants: number;
	publicationDate: string;
	// releaseStatus: string;
	tags: string[];
	thumbnailImageUrl: string;
	updated_at: string;
	// version: number;
	visits: number;
}
