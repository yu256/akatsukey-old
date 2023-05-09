<template>
<div class="_formRoot">
	<FormSection>
		<FormInput v-model="mediaProxy" :placeholder="'URLを入力'">
			<template #label>メディアプロキシ</template>
			<template #caption>メディアプロキシを指定します。</template>
		</FormInput>
		
		<FormSwitch v-model="UseMediaProxy" class="_formBlock">
			メディアプロキシを使用
			<template #caption>メディアプロキシを使用します。必ず上のテキストボックスにURLを入力してください。</template>
		</FormSwitch>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import FormInput from '@/components/form/input.vue';
import FormSwitch from '@/components/form/switch.vue';
import { defaultStore } from '@/store';

const mediaProxy = computed(defaultStore.makeGetterSetter('mediaProxy'));
const UseMediaProxy = computed(defaultStore.makeGetterSetter('UseMediaProxy'));
</script>
