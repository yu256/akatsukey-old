<template>
<MkStickyContainer>
	<template #header><XHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<XQueue v-if="tab === 'deliver'" domain="deliver"/>
		<XQueue v-else-if="tab === 'inbox'" domain="inbox"/>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import XQueue from './queue.chart.vue';
import XHeader from './_header_.vue';
import * as config from '@/config';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let tab = $ref('deliver');

const headerActions = $computed(() => [{
	asFullButton: true,
	icon: 'ti ti-external-link',
	text: i18n.ts.dashboard,
	handler: (): void => {
		window.open(config.url + '/queue', '_blank');
	},
}]);

const headerTabs = $computed(() => [{
	key: 'deliver',
	title: 'Deliver',
}, {
	key: 'inbox',
	title: 'Inbox',
}]);

definePageMetadata({
	title: i18n.ts.jobQueue,
	icon: 'ti ti-clock-play',
});
</script>
