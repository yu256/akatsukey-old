<template>
	<div class="_formRoot">
		<FormInfo class="_formBlock">以下の機能はすべてベータ版です。</FormInfo>

		<FormSwitch v-model="$store.state.navBarChatIcon" class="_formBlock">チャットを表示する</FormSwitch>
		<FormSwitch v-model="$store.state.navBarReloadIcon" class="_formBlock">リロードを表示する</FormSwitch>
		<FormSwitch v-model="$store.state.navBarWidgetIcon" class="_formBlock">ウィジェットを表示する</FormSwitch>
	</div>
</template>
	
<script lang="ts" setup>
	import FormInfo from '@/components/MkInfo.vue';
	import FormSwitch from '@/components/form/switch.vue';
</script>
