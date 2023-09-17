<template>
<MkA v-adaptive-bg :to="`/vrchat/${user.id}`" :class="[$style.root, { yellow: user.isFriend }]">
	<VrcAvatar class="avatar" :friend="user"/>
	<div class="body">
		<span class="name">{{ user.displayName }}</span>
		<span v-if="user.statusDescription" class="sub"><span class="acct _monospace">{{ user.statusDescription }}</span></span>
	</div>
</MkA>
</template>

<script lang="ts" setup>
import VrcAvatar from '@/components/VrcAvatar.vue';
import { HitUsers } from '@/scripts/vrchat-api';
import { ArrayElementType } from '@/types/custom-utilities';

defineProps<{
	user: ArrayElementType<HitUsers>;
}>();
</script>

<style lang="scss" module>
.root {
	$bodyTitleHeight: 18px;
	$bodyInfoHeight: 16px;

	display: flex;
	align-items: center;
	padding: 16px;
	background: var(--panel);
	border-radius: 8px;

	> :global(.avatar) {
		display: block;
		width: ($bodyTitleHeight + $bodyInfoHeight);
		height: ($bodyTitleHeight + $bodyInfoHeight);
		margin-right: 12px;
	}

	> :global(.body) {
		flex: 1;
		overflow: hidden;
		font-size: 0.9em;
		color: var(--fg);
		padding-right: 8px;

		> :global(.name) {
			display: block;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: $bodyTitleHeight;
		}

		> :global(.sub) {
			display: block;
			width: 100%;
			font-size: 95%;
			opacity: 0.7;
			line-height: $bodyInfoHeight;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	&:global(.yellow) {
		--c: rgb(255 196 0 / 15%);
		background-image: linear-gradient(45deg, var(--c) 16.67%, transparent 16.67%, transparent 50%, var(--c) 50%, var(--c) 66.67%, transparent 66.67%, transparent 100%);
		background-size: 16px 16px;
	}
}
</style>
