import { defaultStore } from '@/store';
import { alert as miAlert, select, toast } from '@/os';

type ApiResponse<T> = { Success: T } | { Error: string };

type VrcEndPoints = VrcEndPointsMultiArgs & {
	'auth': string;
	'twofactor': string;
	'friends': {
		'public': Friend[];
		'private': Friend[];
	};
	'favfriends': VrcEndPoints['friends'];
	'favorites/refresh': true;
}

type VrcEndPointsMultiArgs = {
	'instance': Instance;
	'user': User;
	'search_user': HitUsers;
	'friend_request': true;
	'friend_status': Status;
	'world': World;
	'group': Group;
	'favorites': true;
}

export async function fetchData<E extends keyof VrcEndPoints, T extends VrcEndPoints[E]>(url: E, body: string): Promise<T | undefined> {
	const res: ApiResponse<T> = await fetch(defaultStore.state.VRChatURL + url, {
		method: 'POST',
		body,
	}).then(r => r.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	return res.Success;
}

export function fetchDataWithAuth<E extends keyof VrcEndPointsMultiArgs>(url: E, body: string): Promise<VrcEndPointsMultiArgs[E] | undefined> {
	return fetchData(url, defaultStore.state.VRChatAuth + ':' + body);
}

export function addToFavorites(favoriteId: string, values: readonly string[]): void {
	const items = values.map(value => (
		{
			value,
			text: value,
		}
	));

	select({ title: 'お気に入りするグループ', items }).then(res => {
		if (res.canceled) return;
		fetchDataWithAuth('favorites', `${values[0] === 'group_0' ? 'friend' : values[0].slice(0, -2)}:${favoriteId}:${res.result}`)
			.then(ok => ok && toast('✅'));
	});
}

export type Friend = Pick<User, 'currentAvatarThumbnailImageUrl' | 'location' | 'status'> & {
	id: string;
	undetermined: boolean;
};

export type Instance = {
	ownerId: string | null;
	userCount: number;
	name: string;
	description: string;
	thumbnailImageUrl: string;
	users: Record<string, string>;
};

export type User = {
	bio: string;
	bioLinks: string[];
	currentAvatarThumbnailImageUrl: string;
	displayName: string;
	isFriend: boolean;
	location: string;
	travelingToLocation: string | null;
	status: 'join me' | 'active' | 'ask me' | 'busy';
	statusDescription: string | null;
	rank: string;
};

export type HitUsers = Array<Pick<User, 'currentAvatarThumbnailImageUrl' | 'displayName' | 'statusDescription' | 'isFriend'> & {
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

type Gallery = {
	id: string;
	name: string;
	description: string;
	membersOnly: boolean;
	roleIdsToView: string[] | null;
	roleIdsToSubmit: string[];
	roleIdsToAutoApprove: string[];
	roleIdsToManage: string[];
	createdAt: string;
	updatedAt: string;
}

type Member = {
	id: string;
	groupId: string;
	userId: string;
	roleIds: string[];
	managerNotes: string | null;
	membershipStatus: string;
	isSubscribedToAnnouncements: boolean;
	visibility: string;
	isRepresenting: boolean;
	joinedAt: string;
	bannedAt: string | null;
	has2FA: boolean;
	permissions: string[];
}

export type Group = {
	id: string;
	name: string;
	shortCode: string;
	discriminator: string;
	description: string;
	iconUrl: string;
	bannerUrl: string;
	privacy: string;
	ownerId: string;
	rules: string;
	links: string[];
	languages: string[];
	iconId: string | null;
	bannerId: string;
	memberCount: number;
	memberCountSyncedAt: string;
	isVerified: boolean;
	joinState: string;
	tags: string[];
	galleries: Gallery[];
	createdAt: string;
	onlineMemberCount: number;
	membershipStatus: string;
	myMember: Member | null;
}
