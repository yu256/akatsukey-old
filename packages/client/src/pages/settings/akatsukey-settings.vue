<template>
<div class="_formRoot">
	<MkInfo warn class="_formBlock">設定は自動で保存されません。画面下部の保存ボタンを使用してください。</MkInfo>

	<FormSection>
		<FormSwitch v-model="navBarChatIcon" class="_formBlock">
			チャットを表示
			<template #caption>モバイルのボトムナビゲーションにチャットを表示します。</template>
		</FormSwitch>

		<FormSwitch v-model="navBarReloadIcon" class="_formBlock">
			リロードを表示
			<template #caption>モバイルのボトムナビゲーションにリロードを表示します。</template>
		</FormSwitch>

		<FormSwitch v-model="navBarWidgetIcon" class="_formBlock">
			ウィジェットを表示
			<template #caption>モバイルのボトムナビゲーションにウィジェットを表示します。</template>
		</FormSwitch>

		<FormSwitch v-model="postFormEmojiPickerNewStyleEnabled" class="_formBlock">
			新しい絵文字ピッカーを使用する
			<template #caption>投稿画面の下に絵文字ピッカーを表示します。</template>
		</FormSwitch>
	
		<FormSwitch v-model="postFormFooterEmojiIconEnabled" class="_formBlock">
			絵文字ボタンを表示
			<template #caption>投稿画面のフッターに絵文字ボタンを表示します。</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="RenoteCollapsedEnabled" class="_formBlock">
			一度見たノートのRenoteを畳む
			<template #caption>タイムライン上の一度見たノートのRenoteを畳んで表示します。本文をクリックすると展開します。</template>
		</FormSwitch>
	</FormSection>

	<MkButton class="_formBlock" primary :disabled="!changed" @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

let changed = $ref(false);

const navBarChatIcon = $ref(defaultStore.state.navBarChatIcon);
const navBarReloadIcon = $ref(defaultStore.state.navBarReloadIcon);
const navBarWidgetIcon = $ref(defaultStore.state.navBarWidgetIcon);
const postFormEmojiPickerNewStyleEnabled = $ref(defaultStore.state.postFormEmojiPickerNewStyleEnabled);
const postFormFooterEmojiIconEnabled = $ref(defaultStore.state.postFormFooterEmojiIconEnabled);
const RenoteCollapsedEnabled = $ref(defaultStore.state.RenoteCollapsedEnabled);

watch([
	$$(navBarChatIcon),
	$$(navBarReloadIcon),
	$$(navBarWidgetIcon),
	$$(postFormEmojiPickerNewStyleEnabled),
	$$(postFormFooterEmojiIconEnabled),
	$$(RenoteCollapsedEnabled),
], () => {
	changed = true;
});

async function save(): Promise<void> {
	if (await check()) {
		defaultStore.set('navBarChatIcon', navBarChatIcon);
		defaultStore.set('navBarReloadIcon', navBarReloadIcon);
		defaultStore.set('navBarWidgetIcon', navBarWidgetIcon);
		defaultStore.set('postFormEmojiPickerNewStyleEnabled', postFormEmojiPickerNewStyleEnabled);
		defaultStore.set('postFormFooterEmojiIconEnabled', postFormFooterEmojiIconEnabled);
		defaultStore.set('RenoteCollapsedEnabled', RenoteCollapsedEnabled);

		const { canceled } = await os.confirm({
			type: 'info',
			text: i18n.ts.reloadToApplySetting,
		});

		if (canceled) return;

		unisonReload();
	} else {
		os.alert({
			type: 'error',
		});
	}
}
</script>
