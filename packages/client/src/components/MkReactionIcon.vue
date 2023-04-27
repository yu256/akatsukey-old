<template>
<MkEmoji :emoji="reaction" :custom-emojis="customEmojis || []" :is-reaction="true" :normal="true" :no-style="noStyle" :use-fallback-icon="useFallbackIcon"/>
</template>

<script lang="ts" setup>
defineProps<{
	reaction: string;
	customEmojis?: any[]; // TODO
	noStyle?: boolean;
	useFallbackIcon?: boolean;
}>();
</script>
