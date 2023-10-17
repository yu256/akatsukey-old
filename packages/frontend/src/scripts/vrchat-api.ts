import { defaultStore } from '@/store';
import { alert as miAlert, select, toast } from '@/os';
import { ArrayElementType } from '@/types/custom-utilities';

type ApiResponse<T> = { Success: T } | { Error: string };

type VrcEndPoints = {
	auth: {
		withAuth: false;
		res: string;
	}
	twofactor: {
		withAuth: false;
		res: string;
	}
	profile: {
		withAuth: false;
		res: true;
	}
	instance: {
		withAuth: true;
		res: Instance;
	}
	user: {
		withAuth: true;
		res: User;
	}
	search_user: {
		withAuth: true;
		res: HitUsers;
	}
	friend_request: {
		withAuth: true;
		res: true;
	}
	friend_status: {
		withAuth: true;
		res: Status;
	}
	world: {
		withAuth: true;
		res: World;
	}
	group: {
		withAuth: true;
		res: World;
	}
	favorites: {
		withAuth: true;
		res: true;
	}
	friends: {
		withAuth: true;
		res: {
			public: Friend[];
			private: Friend[];
		};
	}
	favfriends: {
		withAuth: true;
		res: VrcEndPoints['friends'];
	}
	'favorites/refresh': {
		withAuth: true;
		res: true;
	}
	notifications: {
		withAuth: true;
		res: Notification[];
	}
}

type CheckAuth<WITHAUTH, E extends keyof VrcEndPoints> = WITHAUTH extends true
	? (VrcEndPoints[E]['withAuth'] extends true ? true : false)
	: (VrcEndPoints[E]['withAuth'] extends false ? true : false);

type ValidateAuth<WITHAUTH, E extends keyof VrcEndPoints> = CheckAuth<WITHAUTH, E> extends true
	? E
	: never;

const fetchData = <WITHAUTH>(auth = '') =>
	async <E extends keyof VrcEndPoints, T extends VrcEndPoints[E]['res']>(url: ValidateAuth<WITHAUTH, E>, body?: string | object): Promise<T | undefined> => {
		const option: RequestInit = {
			method: 'POST',
		};

		if (typeof body === 'object') {
			option.headers = {
				'Content-Type': 'application/json',
			};
			// eslint-disable-next-line no-param-reassign
			body = JSON.stringify(body);
		}

		option.body = body ? `${auth && `${auth}:`}${body}` : auth;

		const res: ApiResponse<T> = await fetch(defaultStore.state.VRChatURL + url, option).then(r => r.json());

		if ('Error' in res) {
			miAlert({
				type: 'error',
				text: res.Error,
			});
			return;
		}

		return res.Success;
	};

export const fetchVrcWithAuth = fetchData<true>(defaultStore.state.VRChatAuth);

export const fetchVrc = fetchData<false>();

export function addToFavorites(favoriteId: string, values: readonly string[]): void {
	const items = values.map(value => (
		{
			value,
			text: value,
		}
	));

	select({ title: 'お気に入りするグループ', items }).then(res => void (res.canceled ||
		fetchVrcWithAuth('favorites', `${values[0] === 'group_0' ? 'friend' : values[0].slice(0, -2)}:${favoriteId}:${res.result}`)
			.then(ok => ok && toast('✅'))
	));
}

export const status = ['join me', 'active', 'ask me', 'busy'] as const satisfies readonly string[];

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
	status: ArrayElementType<typeof status>;
	statusDescription: string | null;
	rank: string;
	hasUserIcon: boolean;
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

export type Notification = {
	id: string;
	senderUserId: string;
	senderUsername: string;
	type: string;
	message: string;
	details: 'NotificationDetailInvite' | 'NotificationDetailInviteResponse' | 'NotificationDetailRequestInvite' | 'NotificationDetailRequestInviteResponse' | 'NotificationDetailVoteToKick' | null;
	seen: boolean;
	created_at: string;
}
