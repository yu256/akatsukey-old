<template>
<MkLoading v-if="fetching"/>
<template v-else-if="group">
	<div :class="[$style.container, $style.content]">
		<div>
			<a style="font-size:2em" :href="`https://vrchat.com/home/group/${id}`" target="_blank" rel="noopener">{{ group.name }}</a>
			<img :src="group.bannerUrl" :class="$style.img" decoding="async"/>
			<div>{{ group.description }}</div>
		</div>
		<img :class="$style.img" :src="group.iconUrl" decoding="async"/>
	</div>
	<div v-if="detailed">
		todo
	</div>
</template>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Group, fetchDataWithAuth } from '@/scripts/vrchat-api';

const props = withDefaults(defineProps<{
	id: string;
	detailed?: boolean;
}>(), {
	detailed: false,
});

const fetching = ref(true);
const group = ref<Group>();

onMounted(async () => {
	group.value = await fetchDataWithAuth('group', props.id);
	fetching.value = false;
});
</script>

<style lang="scss" module>
@container (min-width: 400px) {
	.container {
		display: grid;
		grid-template-columns: 1fr 1fr;
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
