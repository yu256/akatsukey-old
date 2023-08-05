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
			VRChat APIのトークンを設定
			<MkInput v-model="username" type="text" placeholder="ユーザーネームもしくはメールアドレス"/>
			<MkInput v-model="password" type="password" placeholder="パスワード"/>
			<MkButton @click="setToken">決定</MkButton>
			<MkInput v-model="twofactor" type="text" placeholder="2FAコード"/>
			<MkButton @click="do2fa">決定</MkButton>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { WritableComputedRef, computed, shallowRef } from 'vue';
import { defaultStore } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import { api, alert as miAlert } from '@/os';

const username = shallowRef('');
const password = shallowRef('');
const twofactor = shallowRef('');

const onAuthenticationError = (): void => {
	miAlert({
		type: 'error',
		text: '認証に失敗しました。',
	});
};

async function setToken(): Promise<void> {
	if (!username.value || !password.value) return;

	try {
		const res = await api('vrchat', {
			user: username.value,
			password: password.value,
		});

		if (!res) {
			onAuthenticationError();
			return;
		}

		defaultStore.set('VRChatToken', res);
		miAlert({
			type: 'info',
			text: '二段階認証が必要です。',
		});
	} catch {
		onAuthenticationError();
	}
}

async function do2fa(): Promise<void> {
	const verified = await api('vrchat/email-2fa', {
		token: defaultStore.state.VRChatToken,
		twofactor: twofactor.value,
	});

	if (verified) {
		miAlert({
			type: 'success',
			text: '二段階認証が完了しました。',
		});
	} else {
		miAlert({
			type: 'error',
			text: '二段階認証に失敗しました。',
		});
	}
}

const useNumberquote = computed(defaultStore.makeGetterSetter('useNumberquote')) as WritableComputedRef<boolean>;
const disableAutostop = computed(defaultStore.makeGetterSetter('disableAutostop')) as WritableComputedRef<boolean>;
const useOriginalInstanceTicker = computed(defaultStore.makeGetterSetter('useOriginalInstanceTicker')) as WritableComputedRef<boolean>;

</script>
