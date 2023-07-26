<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<div class="_gaps_m">
			<VrcAvatar :friend="user" :class="$style.avatar"/>
			<span :class="$style.main">{{ user.displayName }} {{ user.statusDescription }}</span>
			<MkTime :time="user.last_activity"/>
			<div :class="$style.detail">{{ user.bio }}</div>
			<div v-for="bioLink in user.bioLinks" :key="bioLink" :class="$style.link">
				<a :href="bioLink" target="_blank">・ {{ bioLink }}</a>
			</div>
			<div v-if="instance">
				<span :class="$style.main">{{ instance.name }}</span> ({{ instance.userCount }})
				<MkA :to="`/vrchat/${instance.ownerId}`">{{ owner!.displayName }}</MkA>
				<div :class="$style.detail">{{ instance.description }}</div>
				<img :src="instance.thumbnailImageUrl" decoding="async" style="border-radius: 10%;"/>
			</div>
			<div v-else>
				{{ user.location }}
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import VrcAvatar from '@/components/VrcAvatar.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { fetchInstance, fetchUser } from '@/scripts/vrchat-api';

const props = defineProps<{
	id: string;
}>();

const user = await fetchUser(props.id);

const instance = user.location.startsWith('wrld') ? await fetchInstance(user.location) : undefined;

const owner = instance && await fetchUser(instance.ownerId);

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>

<style lang="scss" module>
.main {
	font-size: 1.3em;
	border-bottom: 2px dotted;
}

.avatar {
	width: 50px;
	height: 50px;
	margin: auto;
}

.link {
	margin-left: 1em;
}

.detail {
	margin: .5em;
}
</style>
