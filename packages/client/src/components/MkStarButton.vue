<template>
<button class="suta _button" @click="star($event)">
		<i class="fas fa-star"></i>
</button>
</template>

<script lang="ts" setup>
import type { Note } from 'misskey-js/built/entities';
import Ripple from '@/components/MkRipple.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';

const props = defineProps<{
	note: Note;
}>();

function star(ev?: MouseEvent): void {
	pleaseLogin();
	os.api('notes/reactions/create', {
		noteId: props.note.id,
		reaction: '⭐',
	});
	const el = ev && (ev.currentTarget ?? ev.target) as HTMLElement | null | undefined;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(Ripple, { x, y }, {}, 'end');
	}
}
</script>

<style lang="scss" scoped>
.suta {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
}
</style>
