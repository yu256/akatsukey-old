<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<MKSpacer v-if="!(typeof error === 'undefined')" :contentMax="1200">
		<div :class="$style.root">
			<img :class="$style.img" src="https://xn--931a.moe/assets/error.jpg" class="_ghost"/>
			<p :class="$style.text">
				<i class="ti ti-alert-triangle"></i>
				{{ error }}
			</p>
		</div>
	</MKSpacer>
	<MkSpacer v-else :contentMax="1200">
		<div class="_gaps_s">
			<div v-if="role">{{ role.description }}</div>
			<MkUserList :pagination="users" :extractor="(item) => item.user"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import * as os from '@/os';
import MkUserList from '@/components/MkUserList.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { instanceName } from '@/config';

const props = defineProps<{
	role: string;
}>();

let role = $ref();
let error = $ref();

watch(() => props.role, () => {
	os.api('roles/show', {
		roleId: props.role,
	}).then(res => {
		role = res;
		document.title = `${role?.name} | ${instanceName}`;
	}).catch((err) => {
		if (err.code === 'NO_SUCH_ROLE') {
			error = i18n.ts.noRole;
		} else {
			error = i18n.ts.somethingHappened;
		}
		document.title = `${error} | ${instanceName}`;
	});
}, { immediate: true });

const users = $computed(() => ({
	endpoint: 'roles/users' as const,
	limit: 30,
	params: {
		roleId: props.role,
	},
}));

definePageMetadata(computed(() => ({
	title: role?.name,
	icon: 'ti ti-badge',
})));
</script>

<style lang="scss" module>
.root {
	padding: 32px;
	text-align: center;
  align-items: center;
}

.text {
	margin: 0 0 8px 0;
}

.img {
	vertical-align: bottom;
  width: 128px;
	height: 128px;
	margin-bottom: 16px;
	border-radius: 16px;
}
</style>

