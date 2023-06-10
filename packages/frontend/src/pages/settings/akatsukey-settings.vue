<template>
<div class="_formRoot">
	<MkInfo class="_formBlock">以下の機能はフォークの機能です。</MkInfo>
	<FormSection>
		<MkSwitch v-model="useNumberquote" class="_formBlock">
			「パクる」と「数字引用」機能を有効にする
			<template #caption>Renoteメニューに「パクる」と「数字引用する」を追加します。</template>
		</MkSwitch>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';

const useNumberquote = computed(defaultStore.makeGetterSetter('useNumberquote'));

</script>
