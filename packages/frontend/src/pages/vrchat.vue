<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer :class="$style.root">
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<div v-if="user" class="_gaps_m vrc" :class="$style.container">
			<span style="display: flex">
				<VrcAvatar :friend="user" :class="$style.avatar"/>
				<span :class="$style.title">{{ user.displayName }} {{ user.statusDescription }}</span>
			</span>
			<MkTime v-if="user.last_activity" :time="user.last_activity"/>
			<div :class="$style.content" class="_gaps_m">
				<div :class="$style.detail">{{ user.bio }}</div>
				<div v-for="bioLink in user.bioLinks" :key="bioLink">
					<a :href="bioLink" target="_blank">・ {{ bioLink }}</a>
				</div>
			</div>
			<div v-if="instance" class="_gaps_m">
				<span style="font-size: 1.5em">{{ instance.name }} ({{ instance.userCount }})</span>
				<MkA v-if="instance.ownerId" :to="`/vrchat/${instance.ownerId}`">
					{{ owner ? owner.displayName : user.displayName }}
				</MkA>
				<div :class="$style.content">
					<div :class="$style.detail">{{ instance.description }}</div>
					<img :class="$style.img" :src="instance.thumbnailImageUrl" decoding="async"/>
				</div>
			</div>
			<div v-else>
				{{ user.location }}
			</div>
		</div>
		<div v-else>
			情報の取得に失敗しました。トークンが無効である可能性があります。
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

// eslint-disable-next-line vue/no-setup-props-destructure
const user = await fetchUser(props.id);

const instance = user?.location.startsWith('wrld') && await fetchInstance(user.location);

const owner = instance && instance.ownerId !== props.id && instance.ownerId && await fetchUser(instance.ownerId);

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>

<style lang="scss" module>
.root a {
	color: var(--link);
}

.container {
	background: var(--navBg);
	border-radius: 2em;
	padding: 1em;
}

.title {
	margin-left: .5em;
	font-size: 2em;
}

.avatar {
	width: 40px;
	height: 40px;
}

.content {
	background: var(--bg);
	border-radius: 1.5em;
	padding: 1em;
}

.img {
	border-radius: 10%;
	margin: 2em auto;
	display: block;
	height: 250px;
}
</style>
