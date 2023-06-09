<template>
<div class="_formRoot">
	<MkInfo class="_formBlock">以下の機能はフォークの機能です。</MkInfo>
	<FormSection>
		<MkSelect v-model="InstanceTickerPosition" class="_formBlock">
			<template #label>ノートのインスタンス情報の表示位置</template>
			<option value="normal">通常</option>
			<option value="leftedge">←左端</option>
			<option value="rightedge">右端→</option>
			<option value="bottomleft">↙左下</option>
			<option value="bottomright">右下↘</option>
			<template #caption>タイムライン上のインスタンス情報を指定した位置に表示します。</template>
		</MkSelect>
	</FormSection>
	<FormSection>
		<MkSwitch v-model="UseNumberquote" class="_formBlock">
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
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';

const InstanceTickerPosition = computed(defaultStore.makeGetterSetter('instanceTickerPosition'));
const UseNumberquote = computed(defaultStore.makeGetterSetter('UseNumberquote'));

</script>
