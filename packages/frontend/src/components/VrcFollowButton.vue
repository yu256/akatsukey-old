<template>
<MkLoading v-if="!res"/>
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
import { ref } from 'vue';
import MkButton from './MkButton.vue';
import { Status, fetchVrcWithAuth } from '@/scripts/vrchat-api';
import { confirm } from '@/os';

const emit = defineEmits<{
	(ev: 'success', value: boolean): void
}>();

const props = defineProps<{
	id: string;
}>();

const res = ref<Status>();

// eslint-disable-next-line vue/no-setup-props-destructure
fetchVrcWithAuth('friend/status', props.id).then(r => { res.value = r; });

function request(isPost: boolean): void {
	confirm({
		type: 'warning',
		text: `フレンド申請を${isPost ? '送信' : '解除'}しますか？`,
	}).then( async ({ canceled }) => {
		if (canceled || !await fetchVrcWithAuth('friend/request', props.id + ':' + (isPost ? 'POST' : 'DELETE'))) return;

		emit('success', isPost);
	});
}
</script>
