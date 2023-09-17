<template>
<component :is="friend.id ? 'MkA' : 'span'" class="_noSelect" :class="[$style.root, { [$style.square]: defaultStore.state.squareAvatars }]" :to="`/vrchat/${friend.id}`">
	<img :class="$style.inner" :src="friend.currentAvatarThumbnailImageUrl" decoding="async"/>
	<div v-if="friend.status" v-tooltip="friend.status" :class="$style.indicator" :style="`background: ${style}`"/>
</component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';
import { Friend } from '@/scripts/vrchat-api';
import { SomeRequired } from '@/types/custom-utilities';

const props = defineProps<{
	friend: SomeRequired<Partial<Friend>, 'currentAvatarThumbnailImageUrl'>
}>();

const style = computed(() => {
	if (props.friend.location === 'offline') return 'black';

	switch (props.friend.status) {
		case 'join me': return '#58d4c9';
		case 'active': return 'rgb(26, 182, 26)';
		case 'ask me': return props.friend.undetermined ? 'gray' : '#e4bc48';
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
