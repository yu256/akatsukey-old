<template>
<div class="_gaps_m">
	<MkInfo>VRChat API</MkInfo>
	<FormSection>
		<div class="_gaps_s">
			<div class="_margin">トークンを設定</div>
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
			<div class="_margin">認証UUID</div>
			<MkInput v-model="VRChatAuth" type="text"/>
			<div v-if="!fetching_askme">
				<MkSwitch v-model="askme" @update:modelValue="toggleAskMe">
					ask me
					<template #caption>フレンド一覧ウィジェットにask meのユーザーを表示するかどうかを設定します。</template>
				</MkSwitch>
			</div>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { defaultStore } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import { alert as miAlert } from '@/os';
import { fetchData } from '@/scripts/vrchat-api';

const username = ref('');
const password = ref('');
const token = ref('');
const twofactor = ref('');
const askme = ref(true);
const fetching_askme = ref(true);

async function auth(): Promise<void> {
	if (!username.value || !password.value) return;

	const res = await fetchData<string>('auth', `${username.value}:${password.value}`);
	if (!res) return;
	token.value = res;

	miAlert({
		type: 'info',
		text: '二段階認証が必要です。',
	});
}

async function do2fa(): Promise<void> {
	if (!twofactor.value) return;
	const authUUID = defaultStore.state.VRChatAuth && ';' + defaultStore.state.VRChatAuth;

	const res = await fetchData<string>('twofactor', `${token.value}:${twofactor.value}${authUUID}`);
	if (!res) return;
	defaultStore.set('VRChatAuth', res);

	miAlert({
		type: 'success',
		text: '二段階認証が完了しました。',
	});
}

function toggleAskMe(): void {
	fetch(defaultStore.state.VRChatURL + 'askme', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth + ':' + askme.value,
	}).then(async res => {
		if (!res.ok) miAlert({
			type: 'error',
			text: await res.text(),
		});
	});
}

onMounted(() => {
	if (!VRChatAuth.value) return;

	fetch(defaultStore.state.VRChatURL + 'check_askme', {
		method: 'POST',
		body: defaultStore.state.VRChatAuth,
	}).then(async res => {
		if (!res.ok) {
			miAlert({
				type: 'error',
				text: await res.text(),
			});
			return;
		}
		askme.value = await res.text() === 'true';
		fetching_askme.value = false;
	});
});

const VRChatAuth = computed<string>(defaultStore.makeGetterSetter('VRChatAuth'));
const VRChatURL = computed<string>(defaultStore.makeGetterSetter('VRChatURL'));

</script>
