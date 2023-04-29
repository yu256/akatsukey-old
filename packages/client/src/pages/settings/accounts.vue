<template>
<div class="_formRoot">
	<FormSuspense :p="init">
		<FormButton primary @click="addAccount"><i class="ti ti-plus"></i> {{ i18n.ts.addAccount }}</FormButton>

		<div v-for="account in accounts" :key="account.id" class="_panel _button lcjjdxlm" @click="menu(account, $event)">
			<div class="avatar">
				<MkAvatar :user="account" class="avatar"/>
			</div>
			<div class="body">
				<div class="name">
					<MkUserName :user="account"/>
				</div>
				<div class="acct">
					<MkAcct :user="account"/>
				</div>
			</div>
		</div>
	</FormSuspense>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { getAccounts, addAccount as addAccounts, removeAccount as _removeAccount, login, $i } from '@/account';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const storedAccounts = ref<any>(null);
const accounts = ref<any>(null);

const init = async (): Promise<void> => {
	getAccounts().then(accounts => {
		storedAccounts.value = accounts.filter(x => x.id !== $i!.id);

		console.log(storedAccounts.value);

		return os.api('users/show', {
			userIds: storedAccounts.value.map(x => x.id),
		});
	}).then(response => {
		accounts.value = response;
		console.log(accounts.value);
	});
};

const menu = (account, ev): void => {
	os.popupMenu([{
		text: i18n.ts.switch,
		icon: 'ti ti-switch-horizontal',
		action: () => switchAccount(account),
	}, {
		text: i18n.ts.remove,
		icon: 'ti ti-trash',
		danger: true,
		action: () => removeAccount(account),
	}], ev.currentTarget ?? ev.target);
};

const addAccount = (ev): void => {
	os.popupMenu([{
		text: i18n.ts.existingAccount,
		action: (): void => { addExistingAccount(); },
	}, {
		text: i18n.ts.createAccount,
		action: (): void => { createAccount(); },
	}], ev.currentTarget ?? ev.target);
};

const removeAccount = (account): void => _removeAccount(account.id);

const addExistingAccount = (): void => {
	os.popup(defineAsyncComponent(() => import('@/components/MkSigninDialog.vue')), {}, {
		done: res => {
			addAccounts(res.id, res.i);
			os.success();
		},
	}, 'closed');
};

const createAccount = (): void => {
	os.popup(defineAsyncComponent(() => import('@/components/MkSignupDialog.vue')), {}, {
		done: res => {
			addAccounts(res.id, res.i);
			switchAccountWithToken(res.i);
		},
	}, 'closed');
};

const switchAccount = async (account: any): Promise<void> => {
	const fetchedAccounts: any[] = await getAccounts();
	const token = fetchedAccounts.find(x => x.id === account.id).token;
	switchAccountWithToken(token);
};

const switchAccountWithToken = (token: string): void => login(token);

definePageMetadata({
	title: i18n.ts.accounts,
	icon: 'ti ti-users',
});
</script>

<style lang="scss" scoped>
.lcjjdxlm {
	display: flex;
	padding: 16px;

	> .avatar {
		display: block;
		flex-shrink: 0;
		margin: 0 12px 0 0;

		> .avatar {
			width: 50px;
			height: 50px;
		}
	}

	> .body {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: calc(100% - 62px);
		position: relative;

		> .name {
			font-weight: bold;
		}
	}
}
</style>
