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
import { Status, fetchDataWithAuth } from '@/scripts/vrchat-api';
import { confirm } from '@/os';

const emit = defineEmits<{
	(ev: 'success', value: boolean): void
}>();

const props = defineProps<{
	id: string;
}>();

const res = ref<Status>();
const fetching = ref(true);

onMounted(async () => {
	res.value = await fetchDataWithAuth('friend_status', props.id);
	fetching.value = false;
});

function request(isPost: boolean): void {
	confirm({
		type: 'warning',
		text: `フレンド申請を${isPost ? '送信' : '解除'}しますか？`,
	}).then( async ({ canceled }) => {
		if (canceled) return;

		if (await fetchDataWithAuth('friend_request', props.id, isPost ? 'POST' : 'DELETE')) emit('success', isPost);
	});
}
</script>
