<template>
<div v-if="user" class="_gaps_m" :class="$style.container">
	<span style="display:flex">
		<VrcAvatar :friend="user" :class="$style.avatar"/>
		<span :class="$style.title">{{ user.displayName }} {{ user.statusDescription }}</span>
	</span>
	<span v-if="user.last_activity">
		フレンド 最終ログイン: <MkTime :time="user.last_activity"/>
	</span>
	<div :class="$style.content" class="_gaps_m">
		<div>{{ user.bio }}</div>
		<div v-for="bioLink in user.bioLinks" :key="bioLink">
			<a :href="bioLink" target="_blank">・ {{ bioLink }}</a>
		</div>
	</div>
	<div v-if="instance" class="_gaps_m">
		<span style="font-size: 1.5em">{{ instance.name }} ({{ instance.userCount }})</span>
		<MkA v-if="instance.ownerId" :to="`/vrchat/${instance.ownerId}`">
			{{ owner ? owner.displayName : user.displayName }}
		</MkA>
		<div :class="[$style.content, $style.grid]">
			<div>{{ instance.description }}</div>
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

const instance = user?.location.startsWith('wrld')
	&& await fetchInstance(user.location);

const owner = instance
	&& instance.ownerId !== props.id
		&& instance.ownerId
			&& await fetchUser(instance.ownerId);

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>

<style lang="scss" module>
@container (min-width: 400px) {
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		.img {
			margin: .5em;
		}
	}
}

.container {
	background: var(--navBg);
	border-radius: 2em;
	padding: 1em;
	a {
		color: var(--link);
	}
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
	width: 100%;
	margin: 1em auto;
}
</style>
