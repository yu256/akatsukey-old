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
			<MkSwitch v-model="usePartialReload">
				部分的にリロードする
				<template #caption>モバイルのボトムバーの挙動を変更します。必要なコンポーネントのみリロードしますが、WebSocketの再接続も行われません。</template>
			</MkSwitch>
			<MkSwitch v-model="disableAutostop">
				バックグラウンドでもタイムラインを更新する
				<template #caption>バックグラウンドで10秒経過したらページネーションのアイテム更新をしない機能を無効にします。</template>
			</MkSwitch>
			VRChat APIのトークンを設定
			<MkInput v-model="username" type="text" placeholder="ユーザーネームもしくはメールアドレス"/>
			<MkInput v-model="password" type="password" placeholder="パスワード"/>
			<MkButton @click="setToken">決定</MkButton>
			<MkInput v-model="twofactor" type="text" placeholder="2FAコード"/>
			<MkButton @click="do2fa">2FA</MkButton>
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
import { fetchToken } from '@/scripts/vrchat-api';
import { api } from '@/os';

const username = shallowRef('');
const password = shallowRef('');
const twofactor = shallowRef('');

async function setToken(): Promise<void> {
	const res = await fetchToken(username.value, password.value);
	defaultStore.set('VRChatToken', res.response.authToken);
}

async function do2fa(): Promise<void> {
	api('vrchat', {
		requestType: 'email2fa',
		token: defaultStore.state.VRChatToken,
		twofactor: twofactor.value,
	});
}

const useNumberquote = computed(defaultStore.makeGetterSetter('useNumberquote'));
const usePartialReload = computed(defaultStore.makeGetterSetter('usePartialReload'));
const disableAutostop = computed(defaultStore.makeGetterSetter('disableAutostop'));
const useOriginalInstanceTicker = computed(defaultStore.makeGetterSetter('useOriginalInstanceTicker'));

</script>
