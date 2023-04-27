<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions"/></template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			none
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import XHeader from './_header_.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const init = async (): Promise<void> => await os.api('admin/meta');

const save = (): void => {
	os.apiWithDialog('admin/update-meta').then(() => {
		fetchInstance();
	});
};

const headerActions = $computed(() => [{
	asFullButton: true,
	icon: 'ti ti-check',
	text: i18n.ts.save,
	handler: save,
}]);

definePageMetadata({
	title: i18n.ts.other,
	icon: 'ti ti-adjustments',
});
</script>
