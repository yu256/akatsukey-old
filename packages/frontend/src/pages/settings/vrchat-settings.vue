<template>
<div class="_gaps_m">
	<MkInfo>
		<a href="https://github.com/yu256/vrcapi_proxy" target="_blank" rel="noopener">
			プロキシの詳細
			<i class="ti ti-external-link"/>
		</a>
	</MkInfo>
	<FormSection>
		<template #label>トークンを設定</template>
		<div class="_gaps_s">
			<MkInput v-model="VRChatURL" type="text" placeholder="プロキシサーバーのURL https://hoge.com/"/>
			<span v-if="!twofactorTemp" class="_gaps_s">
				<MkInput v-model="username" type="text" placeholder="ユーザーネームもしくはメールアドレス"/>
				<MkInput v-model="password" type="password" placeholder="パスワード"/>
				<MkButton @click="auth">決定</MkButton>
			</span>
			<span v-else class="_gaps_s">
				<MkInput :modelValue="twofactorTemp.token" readonly/>
				<MkInput :modelValue="twofactorTemp.auth_type" readonly/>
				<MkInput v-model="twofactor" type="text" placeholder="2FAコード"/>
				<MkButton @click="do2fa">決定</MkButton>
			</span>
			<div class="_margin">認証ID</div>
			<MkInput v-model="VRChatAuth" type="text">
				<template #caption>AuthTokenのキーとなります。複数のクライアントで同じ文字列を入力することで同一のトークンを使用することが可能です。任意の文字列を入力してください。</template>
			</MkInput>
			<MkButton @click="fetchVrcWithAuth('favorites/refresh').then(r => r && toast('✅'))">
				お気に入りフレンドリストの再取得を要求
			</MkButton>
		</div>
	</FormSection>

	<FormSection>
		<template #label>プロフィールウィジェットのステータスセット</template>
		<div class="_gaps_s">
			<template v-for="statusSet, index in VRChatStatusSets" :key="statusSet[0] + statusSet[1]">
				<div :class="$style.flex">
					<MkSelect v-model="statusSet[0]" inline>
						<option v-for="text in status" :key="text" :value="text">{{ text }}</option>
					</MkSelect>
					<MkInput v-model="statusSet[1]" inline/>
					<MkButton inline @click="updateStatusSets(val => val.splice(index, 1))">-</MkButton>
				</div>
			</template>
			<div :class="$style.flex">
				<MkButton @click="updateStatusSets(val => val.push(['active', '']))">+</MkButton>
				<MkButton @click="defaultStore.set('VRChatStatusSets', VRChatStatusSets)">決定</MkButton>
			</div>
		</div>
	</FormSection>

	<FormSection>
		<template #label>ユーザーがVRC+の場合、profilePicOverrideよりもUserIconを優先する</template>
		<MkSwitch v-model="prioritizeUserIcon"/>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef, triggerRef } from 'vue';
import { defaultStore } from '@/store.js';
import MkInfo from '@/components/MkInfo.vue';
import FormSection from '@/components/form/section.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { alert as miAlert, toast } from '@/os.js';
import { fetchVrc, fetchVrcWithAuth, status } from '@/scripts/vrchat-api.js';

const username = ref('');
const password = ref('');
const twofactorTemp = ref<{
    token: string;
    auth_type: string;
}>();
const twofactor = ref('');
const VRChatStatusSets = shallowRef(defaultStore.state.VRChatStatusSets);

async function auth(): Promise<void> {
	if (!username.value || !password.value) return;

	twofactorTemp.value = await fetchVrc('auth', { username: username.value, password: password.value });

	if (twofactorTemp.value) miAlert({
		type: 'info',
		text: '二段階認証が必要です。',
	});
}

async function do2fa(): Promise<void> {
	if (!twofactor.value || !VRChatAuth.value || !twofactorTemp.value) return;

	const res = await fetchVrcWithAuth('twofactor', {
		token: twofactorTemp.value.token,
		two_factor_type: twofactorTemp.value.auth_type,
		two_factor_code: twofactor.value,
	});
	if (!res) return;
	defaultStore.set('VRChatAuth', VRChatAuth.value);

	miAlert({
		type: 'success',
		text: '二段階認証が完了しました。',
	});
}

function updateStatusSets(fn: (val: typeof VRChatStatusSets.value) => void): void {
	fn(VRChatStatusSets.value);
	triggerRef(VRChatStatusSets);
}

const VRChatAuth = computed<string>(defaultStore.makeGetterSetter('VRChatAuth'));
const VRChatURL = computed<string>(defaultStore.makeGetterSetter('VRChatURL'));
const prioritizeUserIcon = computed<boolean>(defaultStore.makeGetterSetter('VRChatPrioritizeUserIcon'));

</script>

<style lang="scss" module>
.flex {
	display: flex;
	gap: 1em;
}
</style>
