<template>
<span style="display:flex">
	<VrcAvatar :friend="user" :class="$style.avatar"/>
	<span v-if="user.statusDescription" :class="$style.title" style="font-size:1.5em">
		<a :href="`https://vrchat.com/home/user/${id}`" target="_blank" rel="noopener">{{ user.displayName }}</a>
		<span class="description">{{ user.statusDescription }}</span>
	</span>
	<a v-else :class="$style.title" :href="`https://vrchat.com/home/user/${id}`" target="_blank" rel="noopener">{{ user.displayName }}</a>
</span>
<span v-if="user.isFriend">
	フレンド ({{ user.rank }})
</span>
<span v-else style="position:relative">
	{{ user.rank }}<VrcFollowButton :id="id" :class="$style.follow" @success="is => toast(`フレンド申請を${is ? '送信' : '解除'}しました。`)"/>
</span>
<div v-if="user.bio || user.bioLinks.length" :class="$style.content" class="_gaps_m">
	<div v-if="user.bio"><template v-for="text in user.bio.split('\n')" :key="text">{{ text }}<br></template></div>
	<div v-for="bioLink in user.bioLinks" :key="bioLink">
		<a :href="bioLink" target="_blank">・ {{ bioLink }}</a>
	</div>
</div>
<div v-else>プロフィールはありません。</div>
</template>

<script lang="ts" setup>
import VrcAvatar from '@/components/VrcAvatar.vue';
import VrcFollowButton from '@/components/VrcFollowButton.vue';
import { toast } from '@/os';
import { User } from '@/scripts/vrchat-api';

defineProps<{
	user: User;
	id: string;
}>();
</script>

<style lang="scss" module>
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

.follow {
	position: absolute;
	top: 0;
	right: 0;
}

.content {
	background: var(--bg);
	border-radius: 1.5em;
	padding: 1em;
}
</style>
