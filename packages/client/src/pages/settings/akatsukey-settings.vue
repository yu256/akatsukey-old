<template>
<div class="_formRoot">
	<FormInfo class="_formBlock">以下の機能はフォークの機能です。</FormInfo>
	<FormSection>
		<FormSelect v-model="InstanceTickerPosition" class="_formBlock">
			<template #label>ノートのインスタンス情報の表示位置</template>
			<option value="normal">通常</option>
			<option value="leftedge">←左端</option>
			<option value="rightedge">右端→</option>
			<option value="bottomleft">↙左下</option>
			<option value="bottomright">右下↘</option>
			<template #caption>タイムライン上のインスタンス情報を指定した位置に表示します。</template>
		</FormSelect>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="UsePakuru" class="_formBlock">
			「パクる」機能を有効にする
			<template #caption>Renoteメニューに「パクる」を追加します。</template>
		</FormSwitch>

		<FormSwitch v-model="UseNumberquote" class="_formBlock">
			「数字引用」機能を有効にする
			<template #caption>Renoteメニューに「数字引用する」を追加します。</template>
		</FormSwitch>
	</FormSection>

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
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';
import FormInfo from '@/components/MkInfo.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';

const UsePakuru = computed(defaultStore.makeGetterSetter('UsePakuru'));
const UseNumberquote = computed(defaultStore.makeGetterSetter('UseNumberquote'));
const InstanceTickerPosition = computed(defaultStore.makeGetterSetter('instanceTickerPosition'));
const navBarChatIcon = computed(defaultStore.makeGetterSetter('navBarChatIcon'));
const navBarReloadIcon = computed(defaultStore.makeGetterSetter('navBarReloadIcon'));
const navBarWidgetIcon = computed(defaultStore.makeGetterSetter('navBarWidgetIcon'));
</script>
