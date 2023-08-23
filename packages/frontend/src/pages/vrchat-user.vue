<template>
<MkLoading v-if="fetching"/>
<div v-else-if="user" class="_gaps_m" :class="$style.container">
	<VrchatUser :id="id" :user="user"/>
	<div v-if="instance" class="_gaps_m">
		<MkA :to="`/world/${user.location.split(':')[0]}`" style="font-size: 1.5em">{{ instance.name }} ({{ instance.userCount }})</MkA>
		<MkA v-if="instance.ownerId" :to="`/vrchat/${instance.ownerId}`">
			<div v-if="owner">
				<VrcAvatar :friend="owner" :class="$style.avatar_host"/>{{ owner.displayName }}
			</div>
			<div v-else-if="instance.ownerId.startsWith('usr')">
				<VrcAvatar :friend="user" :class="$style.avatar_host"/>{{ user.displayName }}
			</div>
			<div v-else>
				<VrcGroup :id="instance.ownerId"/>
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
import VrchatUser from '@/components/VrcUser.user.vue';
import VrcAvatar from '@/components/VrcAvatar.vue';
import VrcGroup from '@/components/VrcGroup.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { Instance, User, fetchDataWithAuth } from '@/scripts/vrchat-api';

const props = defineProps<{
	id: string;
}>();

const user = ref<User>();
const instance = ref<Instance>();
const owner = ref<User>();

const fetching = ref(true);

onMounted(async () => {
	user.value = await fetchDataWithAuth('user', props.id);

	if (!(user.value?.location.startsWith('wrld'))) {
		fetching.value = false;
		return;
	}

	instance.value = await fetchDataWithAuth('instance', user.value.location);

	if (!instance.value || instance.value.ownerId === props.id || !(instance.value.ownerId?.startsWith('usr'))) {
		fetching.value = false;
		return;
	}

	owner.value = await fetchDataWithAuth('user', instance.value.ownerId);
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

.container {
	background: var(--navBg);
	border-radius: 2em;
	padding: 1em;
	a {
		color: var(--link);
	}
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
