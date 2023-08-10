<template>
<MkLoading v-if="fetching"/>
<div v-else-if="user" class="_gaps_m" :class="$style.container">
	<span style="display:flex">
		<VrcAvatar :friend="user" :class="$style.avatar"/>
		<span v-if="user.statusDescription" :class="$style.title" style="font-size:1.5em">
			{{ user.displayName }}<span class="description">{{ user.statusDescription }}</span>
		</span>
		<span v-else :class="$style.title">{{ user.displayName }}</span>
	</span>
	<span v-if="user.last_activity">
		フレンド({{ user.rank }}) 最終ログイン: <MkTime :time="user.last_activity"/>
	</span>
	<span v-else>
		{{ user.rank }}<VrcFollowButton :id="props.id" :class="$style.follow" @success="is => toast(`フレンド申請を${is ? '送信' : '解除'}しました。`)"/>
	</span>
	<div v-if="user.bio || user.bioLinks.length" :class="$style.content" class="_gaps_m">
		<div>{{ user.bio }}</div>
		<div v-for="bioLink in user.bioLinks" :key="bioLink">
			<a :href="bioLink" target="_blank">・ {{ bioLink }}</a>
		</div>
	</div>
	<div v-else>プロフィールはありません。</div>
	<div v-if="instance" class="_gaps_m">
		<span style="font-size: 1.5em">{{ instance.name }} ({{ instance.userCount }})</span>
		<MkA v-if="instance.ownerId" :to="`/vrchat/${instance.ownerId}`">
			<div v-if="owner">
				<VrcAvatar :friend="owner" :class="$style.avatar_host"/>{{ owner.displayName }}
			</div>
			<div v-else>
				<VrcAvatar :friend="user" :class="$style.avatar_host"/>{{ user.displayName }}
			</div>
		</MkA>
		<div :class="[$style.content, $style.instance]">
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
import { onMounted, ref } from 'vue';
import VrcAvatar from '@/components/VrcAvatar.vue';
import VrcFollowButton from '@/components/VrcFollowButton.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { Instance, User, fetchInstance, fetchUser } from '@/scripts/vrchat-api';
import { toast } from '@/os';

const props = defineProps<{
	id: string;
}>();

const user = ref<User>();
const instance = ref<Instance>();
const owner = ref<User>();

const fetching = ref(true);

onMounted(async () => {
	user.value = await fetchUser(props.id);

	if (!user.value) {
		fetching.value = false;
		return;
	}

	if (!user.value.location.startsWith('wrld')) {
		fetching.value = false;
		return;
	}

	instance.value = await fetchInstance(user.value.location);

	if (!instance.value || instance.value.ownerId === props.id || !instance.value.ownerId) {
		fetching.value = false;
		return;
	}

	owner.value = await fetchUser(instance.value.ownerId);
	fetching.value = false;
});

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>

<style lang="scss" module>
@container (min-width: 400px) {
	.instance {
		display: grid;
		grid-template-columns: 1fr 1fr;
		.img {
			margin: .5em;
		}
	}
}

.follow {
	position: absolute;
	top: 1em;
	right: 1em;
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
	position: relative;
	:global(.description) {
		font-size: .5em;
		position: absolute;
		top: 70%;
		left: 0; 
	}
}

.avatar {
	width: 40px;
	height: 40px;
}

.avatar_host {
	width: 20px;
	height: 20px;
	margin-right: 1em;
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
