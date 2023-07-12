import { Endpoints } from 'misskey-js/built/api.types';
import { ref } from 'vue';
import { FetchTokenRes, Friend } from './vrchat-api';
import { apiUrl } from '@/config';
import { $i } from '@/account';
export const pendingApiRequestsCount = ref(0);

type EndPoints = Endpoints & {
	'vrchat': {
        req: {
            user: string;
			password: string;
        };
        res: FetchTokenRes;
    };
    'vrchat/email-2fa': {
        req: {
            token: string;
			twofactor: string;
        };
        res: null;
    };
    'vrchat/friends': {
        req: {
            token: string;
        };
        res: Friend[];
    };
}

// Implements Misskey.api.ApiClient.request
export function api<E extends keyof EndPoints, P extends EndPoints[E]['req']>(endpoint: E, data: P = {} as any, token?: string | null | undefined, signal?: AbortSignal): Promise<EndPoints[E]['res']> {
	pendingApiRequestsCount.value++;

	const onFinally = () => {
		pendingApiRequestsCount.value--;
	};

	const promise = new Promise<EndPoints[E]['res'] | void>((resolve, reject) => {
		// Append a credential
		if ($i) (data as any).i = $i.token;
		if (token !== undefined) (data as any).i = token;

		// Send request
		window.fetch(endpoint.indexOf('://') > -1 ? endpoint : `${apiUrl}/${endpoint}`, {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'omit',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		}).then(async (res) => {
			const body = res.status === 204 ? null : await res.json();

			if (res.status === 200) {
				resolve(body);
			} else if (res.status === 204) {
				resolve();
			} else {
				reject(body.error);
			}
		}).catch(reject);
	});

	promise.then(onFinally, onFinally);

	return promise;
}

// Implements Misskey.api.ApiClient.request
export function apiGet <E extends keyof EndPoints, P extends EndPoints[E]['req']>(endpoint: E, data: P = {} as any): Promise<EndPoints[E]['res']> {
	pendingApiRequestsCount.value++;

	const onFinally = () => {
		pendingApiRequestsCount.value--;
	};

	const query = new URLSearchParams(data as any);

	const promise = new Promise<EndPoints[E]['res'] | void>((resolve, reject) => {
		// Send request
		window.fetch(`${apiUrl}/${endpoint}?${query}`, {
			method: 'GET',
			credentials: 'omit',
			cache: 'default',
		}).then(async (res) => {
			const body = res.status === 204 ? null : await res.json();

			if (res.status === 200) {
				resolve(body);
			} else if (res.status === 204) {
				resolve();
			} else {
				reject(body.error);
			}
		}).catch(reject);
	});

	promise.then(onFinally, onFinally);

	return promise;
}
