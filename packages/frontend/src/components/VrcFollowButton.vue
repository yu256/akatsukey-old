<template>
<MkLoading v-if="fetching"/>
<span v-else-if="!res">
	Error
</span>
<MkA v-else-if="res.incomingRequest" :to="'todo'">
	フレンド申請を承認する
</MkA>
<MkButton v-else-if="res.outgoingRequest" @click="request(false)">
	フレンド申請を取り消す
</MkButton>
<MkButton v-else @click="request(true)">
	フレンド申請
</MkButton>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import MkButton from './MkButton.vue';
import { Status, friendRequest, friendStatus } from '@/scripts/vrchat-api';

const emit = defineEmits<{
	(ev: 'success', value: boolean): void
}>();

const props = defineProps<{
	id: string;
}>();

const res = ref<Status>();
const fetching = ref(true);

onMounted(async () => {
	res.value = await friendStatus(props.id);
	fetching.value = false;
});

async function request(isPost: boolean): Promise<void> {
	if (await friendRequest(props.id, isPost)) emit('success', isPost);
}
</script>

<style lang="scss" module>
</style>
