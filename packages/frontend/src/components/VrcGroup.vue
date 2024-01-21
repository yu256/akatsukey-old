<template>
<template v-if="group">
	<div :class="[$style.container, $style.content]">
		<div>
			<a style="font-size:2em" :href="`https://vrchat.com/home/group/${id}`" target="_blank" rel="noopener">{{ group.name }}</a>
			<img :src="group.bannerUrl" :class="$style.img" decoding="async"/>
			<div>{{ group.description }}</div>
		</div>
		<div/>
		<img :class="$style.img" :src="group.iconUrl" decoding="async"/>
	</div>
	<div v-if="detailed">
		todo
	</div>
</template>
<MkLoading v-else/>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Group, fetchVrcWithAuth } from '@/scripts/vrchat-api.js';

const props = withDefaults(defineProps<{
	id: string;
	detailed?: boolean;
}>(), {
	detailed: false,
});

const group = ref<Group>();

// eslint-disable-next-line vue/no-setup-props-destructure
fetchVrcWithAuth('group', props.id).then(r => { group.value = r; });
</script>

<style lang="scss" module>
@container (min-width: 400px) {
	.container {
		display: grid;
		grid-template-columns: 1fr .1fr 1fr;
		.img {
			margin: .5em;
		}
	}
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
