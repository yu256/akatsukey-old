<template>
	<div class="_formRoot">
		<FormInfo class="_formBlock">以下の機能はすべてベータ版です。</FormInfo>

		<FormSwitch v-model="navBarChatIcon" class="_formBlock">チャットを表示する</FormSwitch>
		<FormSwitch v-model="navBarReloadIcon" class="_formBlock">リロードを表示する</FormSwitch>
		<FormSwitch v-model="navBarWidgetIcon" class="_formBlock">ウィジェットを表示する</FormSwitch>
	</div>
</template>
	
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { defaultStore } from '@/store';
	import FormInfo from '@/components/MkInfo.vue';
	import FormSwitch from '@/components/form/switch.vue';

	const navBarChatIcon = computed(defaultStore.makeGetterSetter('navBarChatIcon'));
	const navBarReloadIcon = computed(defaultStore.makeGetterSetter('navBarReloadIcon'));
	const navBarWidgetIcon = computed(defaultStore.makeGetterSetter('navBarWidgetIcon'));
</script>
