<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	ref="buttonEl"
	v-ripple="canToggle"
	class="_button"
	:class="[$style.root, { [$style.reacted]: note.myReaction == reaction, [$style.canToggle]: canToggle || canToggleRemoteEmojiName, [$style.small]: defaultStore.state.reactionsDisplaySize === 'small', [$style.large]: defaultStore.state.reactionsDisplaySize === 'large' }]"
	@click="toggleReaction()"
>
	<MkReactionIcon :class="defaultStore.state.limitWidthOfReaction ? $style.limitWidth : ''" :reaction="reaction" :emojiUrl="note.reactionEmojis[reaction.substring(1, reaction.length - 1)]"/>
	<span :class="$style.count">{{ count }}</span>
</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, shallowRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import XDetails from '@/components/MkReactionsViewer.details.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import * as os from '@/os.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { $i, iAmModerator } from '@/account.js';
import MkReactionEffect from '@/components/MkReactionEffect.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { customEmojis } from '@/custom-emojis.js';
import * as sound from '@/scripts/sound.js';

const props = defineProps<{
	reaction: string;
	count: number;
	isInitial: boolean;
	note: Misskey.entities.Note;
}>();

const mock = inject<boolean>('mock', false);

const emit = defineEmits<{
	(ev: 'reactionToggled', emoji: string, newCount: number): void;
}>();

const buttonEl = shallowRef<HTMLElement>();

const canToggle = computed(() => !props.reaction.match(/@\w/) && $i);

const reactionName = computed(() => props.reaction.slice(1, props.reaction.indexOf('@')));

const canToggleRemoteEmojiName = computed(() => $i && customEmojis.value.find(emoji => emoji.name === reactionName.value)?.name);

async function toggleReaction(): Promise<void> {
	if (!canToggle.value) {
		reactRemoteEmoji();
		return;
	}

	// TODO: その絵文字を使う権限があるかどうか確認

	const oldReaction = props.note.myReaction;
	if (oldReaction) {
		const confirm = await os.confirm({
			type: 'warning',
			text: oldReaction !== props.reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		if (oldReaction !== props.reaction) {
			sound.play('reaction');
		}

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count - 1));
			return;
		}

		os.api('notes/reactions/delete', {
			noteId: props.note.id,
		}).then(() => {
			if (oldReaction !== props.reaction) {
				os.api('notes/reactions/create', {
					noteId: props.note.id,
					reaction: props.reaction,
				});
			}
		});
	} else {
		sound.play('reaction');

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count + 1));
			return;
		}

		os.api('notes/reactions/create', {
			noteId: props.note.id,
			reaction: props.reaction,
		});
	}
}

function anime(): void {
	if (document.hidden) return;
	if (!defaultStore.state.animation) return;
	if (!buttonEl.value) return;

	const rect = buttonEl.value.getBoundingClientRect();
	const x = rect.left + 16;
	const y = rect.top + (buttonEl.value.offsetHeight / 2);
	os.popup(MkReactionEffect, { reaction: props.reaction, x, y }, {}, 'end');
}

function reactRemoteEmoji(): void {
	if (!canToggleRemoteEmojiName.value) {
		importEmojiConfirm();
		return;
	}
	os.api('notes/reactions/create', {
		noteId: props.note.id,
		reaction: `:${canToggleRemoteEmojiName.value}:`,
	});
}

async function importEmojiConfirm(): Promise<void> {
	if (!iAmModerator) return;
	const { canceled } = await os.confirm({
		type: 'info',
		text: `${reactionName.value}をインポートしますか？`,
	});
	if (!canceled) importEmoji().then(() =>
		os.toast(`${reactionName.value}をインポートしました`));
}

async function importEmoji(): Promise<void> {
	const emojiId = await getEmojiId();
	os.api('admin/emoji/copy', {
		emojiId: emojiId,
	});
}

async function getEmojiId(): Promise<string> {
	const host = props.reaction.slice(props.reaction.indexOf('@') + 1, props.reaction.length - 1);

	const res = await os.api('admin/emoji/list-remote', {
		host,
		query: reactionName.value,
	});

	if (!res) throw new Error('Failed to fetch emojiId.');

	return await res.find((emoji: { name: string; }) => emoji.name === reactionName.value).id;
}

watch(() => props.count, (newCount, oldCount) => {
	if (oldCount < newCount) anime();
});

onMounted(() => {
	if (!props.isInitial) anime();
});

if (!mock) {
	useTooltip(buttonEl, async (showing) => {
		const reactions = await os.apiGet('notes/reactions', {
			noteId: props.note.id,
			type: props.reaction,
			limit: 10,
			_cacheKey_: props.count,
		});

		const users = reactions.map(x => x.user);

		os.popup(XDetails, {
			showing,
			reaction: props.reaction,
			users,
			count: props.count,
			targetElement: buttonEl.value,
		}, {}, 'closed');
	}, 100);
}
</script>

<style lang="scss" module>
.root {
	display: inline-flex;
	height: 42px;
	margin: 2px;
	padding: 0 6px;
	font-size: 1.5em;
	border-radius: 6px;
	align-items: center;
	justify-content: center;

	&.canToggle {
		background: var(--buttonBg);

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	&:not(.canToggle) {
		cursor: default;
	}

	&.small {
		height: 32px;
		font-size: 1em;
		border-radius: 4px;

		> .count {
			font-size: 0.9em;
			line-height: 32px;
		}
	}

	&.large {
		height: 52px;
		font-size: 2em;
		border-radius: 8px;

		> .count {
			font-size: 0.6em;
			line-height: 52px;
		}
	}

	&.reacted, &.reacted:hover {
		background: var(--accentedBg);
		color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent) inset;

		> .count {
			color: var(--accent);
		}

		> .icon {
			filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
		}
	}
}

.limitWidth {
	max-width: 150px;
}

.count {
	font-size: 0.7em;
	line-height: 42px;
	margin: 0 0 0 4px;
}
</style>
