<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			<MkInfo class="_formBlock">{{ i18n.ts.proxyAccountDescription }}</MkInfo>
			<MkKeyValue class="_formBlock">
				<template #key>{{ i18n.ts.proxyAccount }}</template>
				<template #value>{{ proxyAccount ? `@${proxyAccount.username}` : i18n.ts.none }}</template>
			</MkKeyValue>

			<FormButton primary class="_formBlock" @click="chooseProxyAccount">{{ i18n.ts.selectAccount }}</FormButton>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import MkKeyValue from '@/components/MkKeyValue.vue';
import FormButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let proxyAccount: any = $ref(null);
let proxyAccountId: any = $ref(null);

const init = async (): Promise<void> => {
	const meta = await os.api('admin/meta');
	proxyAccountId = meta.proxyAccountId;
	if (proxyAccountId) {
		proxyAccount = await os.api('users/show', { userId: proxyAccountId });
	}
};

const chooseProxyAccount = (): void => {
	os.selectUser().then(user => {
		proxyAccount = user;
		proxyAccountId = user.id;
		save();
	});
};

const save = (): void => {
	os.apiWithDialog('admin/update-meta', {
		proxyAccountId: proxyAccountId,
	}).then(() => {
		fetchInstance();
	});
};

definePageMetadata({
	title: i18n.ts.proxyAccount,
	icon: 'ti ti-ghost',
});
</script>
