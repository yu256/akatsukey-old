<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<VRCUser v-if="id" :id="id"/>
		<div v-else>
			todo
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import VRCUser from './vrchat_user.vue';
import { definePageMetadata } from '@/scripts/page-metadata';

defineProps<{
	id?: string;
}>();

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>
