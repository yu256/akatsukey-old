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
	<FormSwitch v-model="navBarChatIcon" class="_formBlock">チャットを表示する</FormSwitch>
	<FormSwitch v-model="navBarReloadIcon" class="_formBlock">リロードを表示する</FormSwitch>
	<FormSwitch v-model="navBarWidgetIcon" class="_formBlock">ウィジェットを表示する</FormSwitch>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';
import FormInfo from '@/components/MkInfo.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';

const InstanceTickerPosition = computed(defaultStore.makeGetterSetter('instanceTickerPosition'));
const navBarChatIcon = computed(defaultStore.makeGetterSetter('navBarChatIcon'));
const navBarReloadIcon = computed(defaultStore.makeGetterSetter('navBarReloadIcon'));
const navBarWidgetIcon = computed(defaultStore.makeGetterSetter('navBarWidgetIcon'));
</script>
