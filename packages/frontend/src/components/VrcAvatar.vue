<template>
<component :is="user.id ? 'MkA' : 'span'" class="_noSelect" :class="[$style.root, { [$style.square]: defaultStore.state.squareAvatars }]" :to="`/vrchat/${user.id}`">
	<img :class="$style.inner" :src="avatarImage(user)" decoding="async"/>
	<div v-if="user.status" v-tooltip="user.status" :class="$style.indicator" :style="`background:${props.user.undetermined?`linear-gradient(225deg,${style} 50%,gray 50%)`:style}`"/>
</component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store.js';
import { Friend, avatarImage } from '@/scripts/vrchat-api.js';
import { SomeRequired } from '@/types/custom-utilities.js';

const props = defineProps<{
	user: SomeRequired<Partial<Friend>, 'currentAvatarThumbnailImageUrl'>
}>();

const style = computed(() => {
	if (props.user.location === 'offline') return 'black';

	switch (props.user.status) {
		case 'join me': return '#58d4c9';
		case 'active': return 'rgb(26, 182, 26)';
		case 'ask me': return '#e4bc48';
		case 'busy': return 'rgb(113, 5, 5)';
		default: return 'black';
	}
});

</script>

<style lang="scss" module>

.root {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;
}

.inner {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	top: 0;
	border-radius: 100%;
	z-index: 1;
	overflow: clip;
	object-fit: cover;
	width: 100%;
	height: 100%;
}

.square {
	border-radius: 20%;

	> .inner {
		border-radius: 20%;
	}
}

.indicator {
	position: absolute;
	z-index: 1;
	bottom: 0;
	left: 0;
	width: 20%;
	height: 20%;
	box-shadow: 0 0 0 3px var(--panel);
	border-radius: 100%;
}
</style>
