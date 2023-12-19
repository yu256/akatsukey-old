<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header>
		<MkTab v-model="tab" :class="$style.tab">
			<option value="featured">{{ i18n.ts.all }}</option>
			<option :value="null">{{ i18n.ts.notes }}</option>
			<option value="all">{{ i18n.ts.all }}</option>
			<option value="files">{{ i18n.ts.withFiles }}</option>
		</MkTab>
	</template>
	<MkNotes :noGap="true" :pagination="pagination" :class="$style.tl"/>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkNotes from '@/components/MkNotes.vue';
import MkTab from '@/components/MkTab.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const tab = ref<string | null>('all');
const isAll = computed(() => tab.value === 'all' || tab.value === 'featured');

const pagination = computed(() => ({
	endpoint: 'users/notes' as const,
	limit: 10,
	params: {
		userId: props.user.id,
		withRenotes: isAll,
		withReplies: isAll,
		withChannelNotes: isAll,
		withFiles: tab.value === 'files',
	},
}));
</script>

<style lang="scss" module>
.tab {
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
