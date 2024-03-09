import { defaultStore } from '@/store.js';
import { alert as miAlert, select, toast } from '@/os.js';
import { SomeRequired } from '@/types/custom-utilities.js';

type ApiResponse<T> = T | { error: string };

type VrcEndPoints = {
	auth: {
		withAuth: false;
		req: {
			username: string;
			password: string;
		};
		res: {
			token: string;
			auth_type: string;
		};
	};
	profile: {
		withAuth: true;
		req: {
			user: string;
			query: Pick<
				User,
				'status' | 'statusDescription' | 'bio' | 'bioLinks' | 'userIcon'
			>;
		};
		res: true;
	};
	twofactor: {
		withAuth: true;
		req: {
			token: string;
			two_factor_type: string;
			two_factor_code: string;
		};
		res: string;
	};
	instance: {
		withAuth: true;
		req: {
			instance_id: string;
		};
		res: Instance;
	};
	user: {
		withAuth: true;
		req: {
			user_id?: string;
			force?: boolean;
		};
		res: User;
	};
	'search/user': {
		withAuth: true;
		req: {
			username: string;
			n?: number;
		};
		res: HitUsers;
	};
	world: {
		withAuth: true;
		req: {
			world_id: string;
		};
		res: World;
	};
	group: {
		withAuth: true;
		req: {
			group_id: string;
		};
		res: Group;
	};
	favorites: {
		withAuth: true;
		req: {
			favorite_type: string;
			favorite_id: string;
			tags: string[];
		};
		res: true;
	};
	'favorites/refresh': {
		withAuth: true;
		req: string;
		res: true;
	};
	friends: {
		withAuth: true;
		req: string;
		res: {
			public: Friend[];
			private: Friend[];
		};
	};
	'friends/filtered': VrcEndPoints['friends'];
	'friend/request': {
		withAuth: true;
		req: {
			user_id: string;
			method: 'Request' | 'Delete';
		}
		res: true;
	};
	'friend/status': {
		withAuth: true;
		req: {
			user_id: string;
		}
		res: Status;
	};
	notifications: {
		withAuth: true;
		req: string;
		res: Notification[];
	};
	'invite/myself': {
		withAuth: true;
		req: {
			instance_id: string;
		}
		res: true;
	};
};

type CheckAuth<WITHAUTH, E extends keyof VrcEndPoints> = WITHAUTH extends true
	? VrcEndPoints[E]['withAuth'] extends true
		? true
		: false
	: VrcEndPoints[E]['withAuth'] extends false
		? true
		: false;

type ValidateAuth<WITHAUTH, E extends keyof VrcEndPoints> = CheckAuth<
	WITHAUTH,
	E
> extends true
	? E
	: never;

type Body<T extends keyof VrcEndPoints> = VrcEndPoints[T]['req'] extends string ? string : VrcEndPoints[T]['req'] & {
	auth?: string;
};

const fetchData =
	<WITHAUTH>(auth = '') =>
		async <E extends keyof VrcEndPoints, T extends VrcEndPoints[E]['res']>(
			url: ValidateAuth<WITHAUTH, E>,
			body?: Body<E>,
		): Promise<T | undefined> => {
			const option: RequestInit = {
				method: 'POST',
			};

			let body_: string | object | undefined = body;

			if (typeof body === 'object') {
				option.headers = {
					'Content-Type': 'application/json',
				};
				body.auth = auth;
				body_ = JSON.stringify(body);
			}

			option.body = body_ ? (body_ as string) : auth;

			const res: ApiResponse<T> = await fetch(
				defaultStore.state.VRChatURL + url,
				option,
			)
				.then((r) => r.json())
				.catch(console.error);

			if (typeof res === 'object' && 'error' in res) {
				miAlert({
					type: 'error',
					text: res.error,
				});
				return;
			}

			return res;
		};

export const fetchVrcWithAuth = fetchData<true>(defaultStore.state.VRChatAuth);

export const fetchVrc = fetchData<false>();

export function addToFavorites(
	favoriteId: string,
	values: readonly string[],
): void {
	const items = values.map((value) => ({
		value,
		text: value,
	}));

	select({ title: 'お気に入りするグループ', items }).then((res) => {
		if (res.canceled) return;
		fetchVrcWithAuth('favorites', {
			favorite_type:
				values[0] === 'group_0' ? 'friend' : values[0].slice(0, -2),
			favorite_id: favoriteId,
			tags: [res.result],
		}).then((ok) => ok && toast('✅'));
	});
}

export function updateProfile(query: User): void {
	const req = {
		user: query.id,
		query: {
			status: query.status,
			statusDescription: query.statusDescription ?? '',
			bio: query.bio,
			bioLinks: query.bioLinks,
			userIcon: query.userIcon,
		},
	} as const satisfies VrcEndPoints['profile']['req'];

	fetchVrcWithAuth('profile', req).then((ok) => ok && toast('✅'));
}

export function avatarImage(
	user: SomeRequired<Partial<User>, 'currentAvatarThumbnailImageUrl'>,
): string {
	return (
		(defaultStore.state.VRChatPrioritizeUserIcon
			? user.userIcon ?? user.profilePicOverride
			: user.profilePicOverride ?? user.userIcon) ??
		user.currentAvatarThumbnailImageUrl
	);
}

export const status = [
	'join me',
	'active',
	'ask me',
	'busy',
] as const satisfies readonly string[];

export type Friend = Pick<
	User,
	| 'currentAvatarThumbnailImageUrl'
	| 'profilePicOverride'
	| 'userIcon'
	| 'location'
	| 'status'
> & {
	id: string;
	undetermined: boolean;
};

export type Instance = {
	ownerId?: string;
	userCount: number;
	name: string;
	description: string;
	thumbnailImageUrl: string;
	users: Record<string, string>;
};

export type User = {
	id: string;
	bio: string;
	bioLinks: string[];
	currentAvatarThumbnailImageUrl: string;
	profilePicOverride?: string;
	userIcon?: string;
	displayName: string;
	isFriend: boolean;
	location: string;
	travelingToLocation?: string;
	status: (typeof status)[number];
	statusDescription?: string;
	rank: string;
};

export type HitUsers = Array<
	Pick<
		User,
		| 'currentAvatarThumbnailImageUrl'
		| 'profilePicOverride'
		| 'userIcon'
		| 'displayName'
		| 'statusDescription'
		| 'isFriend'
	> & {
		id: string;
	}
>;

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
	instances?: Array<[string, number, string] | null>;
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
};

type Gallery = {
	id: string;
	name: string;
	description: string;
	membersOnly: boolean;
	roleIdsToView?: string[];
	roleIdsToSubmit: string[];
	roleIdsToAutoApprove: string[];
	roleIdsToManage: string[];
	createdAt: string;
	updatedAt: string;
};

type Member = {
	id: string;
	groupId: string;
	userId: string;
	roleIds: string[];
	managerNotes?: string;
	membershipStatus: string;
	isSubscribedToAnnouncements: boolean;
	visibility: string;
	isRepresenting: boolean;
	joinedAt: string;
	bannedAt?: string;
	has2FA: boolean;
	permissions: string[];
};

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
	iconId?: string;
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
	myMember?: Member;
};

export type Notification = {
	id: string;
	senderUserId: string;
	senderUsername: string;
	type: string;
	message: string;
	details?:
		| 'NotificationDetailInvite'
		| 'NotificationDetailInviteResponse'
		| 'NotificationDetailRequestInvite'
		| 'NotificationDetailRequestInviteResponse'
		| 'NotificationDetailVoteToKick';
	seen: boolean;
	created_at: string;
};
