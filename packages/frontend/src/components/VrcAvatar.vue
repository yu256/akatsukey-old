<template>
<MkA v-if="friend.id" class="_noSelect" :class="[$style.root, { [$style.square]: defaultStore.state.squareAvatars }]" :to="`/vrchat/${props.friend.id}`">
	<img :class="$style.inner" :src="props.friend.currentAvatarThumbnailImageUrl" decoding="async"/>
	<div
		v-tooltip="props.friend.status" :class="[$style.indicator, {
			[$style.join]: props.friend.status === 'join me',
			[$style.active]: props.friend.status === 'active',
			[$style.ask]: props.friend.status === 'ask me',
			[$style.busy]: props.friend.status === 'busy',
			[$style.private]: props.friend.location === 'private',
		}]"
	/>
</MkA>
<span v-else class="_noSelect" :class="[$style.root, { [$style.square]: defaultStore.state.squareAvatars }]">
	<img :class="$style.inner" :src="props.friend.currentAvatarThumbnailImageUrl" decoding="async"/>
	<div
		v-tooltip="props.friend.status" :class="[$style.indicator, {
			[$style.join]: props.friend.status === 'join me',
			[$style.active]: props.friend.status === 'active',
			[$style.ask]: props.friend.status === 'ask me',
			[$style.busy]: props.friend.status === 'busy',
			[$style.private]: props.friend.location === 'private',
			[$style.web]: props.friend.location === 'offline',
		}]"
	/>
</span>
</template>

<script lang="ts" setup>
import { defaultStore } from '@/store';
import { Friend } from '@/scripts/vrchat-api';
import { CustomPartial } from '@/scripts/types';

const props = defineProps<{
	friend: CustomPartial<Friend, 'id'>;
}>();

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
	&.join {
		background: #58d4c9;
	}

	&.active {
		background: rgb(26, 182, 26);
	}

	&.ask {
		background: #e4bc48;
	}

	&.busy {
		background: rgb(113, 5, 5);
	}

	&.private {
		background: brown !important;
	}

	&.web {
		background: black !important;
	}

}

</style>
