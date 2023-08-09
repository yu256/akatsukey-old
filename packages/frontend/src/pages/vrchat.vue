<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<VRCUser v-if="id" :id="id"/>
		<div v-else class="_gaps_m">
			<MkSwitch v-model="showSearchUser">
				ユーザー検索
			</MkSwitch>
			<Search v-if="showSearchUser"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VRCUser from './vrchat-user.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import MkSwitch from '@/components/MkSwitch.vue';
import Search from '@/components/VrcSearchUser.vue';

const showSearchUser = ref(false);

defineProps<{
	id?: string;
}>();

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>
