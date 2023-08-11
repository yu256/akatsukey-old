<template>
<div class="_gaps_m">
	<MkInfo>以下の機能はフォークの機能です。</MkInfo>
	<FormSection>
		<div class="_gaps_s">
			<MkSwitch v-model="useOriginalInstanceTicker">
				オリジナルのインスタンスティッカーを使用する
				<template #caption>インスタンスティッカーを切り替えます。</template>
			</MkSwitch>
			<MkSwitch v-model="useNumberquote">
				「パクる」と「数字引用」機能を有効にする
				<template #caption>Renoteメニューに「パクる」と「数字引用する」を追加します。</template>
			</MkSwitch>
			<MkSwitch v-model="disableAutostop">
				バックグラウンドでもタイムラインを更新する
				<template #caption>バックグラウンドで10秒経過したらページネーションのアイテム更新をしない機能を無効にします。</template>
			</MkSwitch>
			<div class="_margin">VRChat APIのトークンを設定</div>
			<MkInput v-model="VRChatURL" type="text" placeholder="プロキシサーバーのURL https://hoge.com/"/>
			<span v-if="!token" class="_gaps_s">
				<MkInput v-model="username" type="text" placeholder="ユーザーネームもしくはメールアドレス"/>
				<MkInput v-model="password" type="password" placeholder="パスワード"/>
				<MkButton @click="auth">決定</MkButton>
			</span>
			<span v-else class="_gaps_s">
				<MkInput v-model="token" type="text" placeholder="トークン"/>
				<MkInput v-model="twofactor" type="text" placeholder="2FAコード"/>
				<MkButton @click="do2fa">決定</MkButton>
			</span>
			認証UUID
			<MkInput v-model="VRChatAuth" type="text"/>
			<div>
				ask meのユーザーを表示
				<button :class="$style.button" @click="toggleAskMe('t')">オン</button>
				<button :class="$style.button" @click="toggleAskMe('f')">オフ</button>
			</div>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue';
import { defaultStore } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import { alert as miAlert } from '@/os';
import { Err } from '@/scripts/vrchat-api';

const username = shallowRef('');
const password = shallowRef('');
const token = shallowRef('');
const twofactor = shallowRef('');

type Success = {
	Success: string;
}

async function auth(): Promise<void> {
	if (!username.value || !password.value) return;

	const res: Success | Err = await fetch(defaultStore.state.VRChatURL + 'auth', {
		method: 'POST',
		body: `${username.value}:${password.value}`,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	token.value = res.Success;

	miAlert({
		type: 'info',
		text: '二段階認証が必要です。',
	});
}

async function do2fa(): Promise<void> {
	if (!twofactor.value) return;
	const authUUID = defaultStore.state.VRChatAuth && ';' + defaultStore.state.VRChatAuth;

	const res: Success | Err = await fetch(defaultStore.state.VRChatURL + 'twofactor_email', {
		method: 'POST',
		body: `auth=${token.value}:${twofactor.value}${authUUID}`,
	}).then(response => response.json());

	if ('Error' in res) {
		miAlert({
			type: 'error',
			text: res.Error,
		});
		return;
	}

	defaultStore.set('VRChatAuth', res.Success);

	miAlert({
		type: 'success',
		text: '二段階認証が完了しました。',
	});
}

async function toggleAskMe(bool: string): Promise<void> {
	const res: string = await fetch(defaultStore.state.VRChatURL + 'askme', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + bool,
	}).then(response => response.text());

	miAlert({
		type: res.endsWith('。') ? 'success' : 'error',
		text: res,
	});
}

const useNumberquote = computed<boolean>(defaultStore.makeGetterSetter('useNumberquote'));
const disableAutostop = computed<boolean>(defaultStore.makeGetterSetter('disableAutostop'));
const useOriginalInstanceTicker = computed<boolean>(defaultStore.makeGetterSetter('useOriginalInstanceTicker'));
const VRChatAuth = computed<string>(defaultStore.makeGetterSetter('VRChatAuth'));
const VRChatURL = computed<string>(defaultStore.makeGetterSetter('VRChatURL'));

</script>

<style lang="scss" module>
.button {
	padding: 7px 14px;
	font-size: 95%;
	text-decoration: none;
	background: var(--buttonBg);
	border-radius: 5px;
	margin: .5em;
	border: none;
	&:hover {
		background: var(--buttonHoverBg);
	}

	&:active {
		background: var(--buttonHoverBg);
	}
}
</style>
