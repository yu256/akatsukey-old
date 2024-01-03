<template>
<div class="_gaps_m">
	<MkInfo>以下の機能はフォークの機能です。</MkInfo>
	<FormSection>
		<div class="_gaps_s">
			<MkSwitch v-model="useOriginalInstanceTicker">
				オリジナルのインスタンスティッカーを使用する
				<template #caption>インスタンスティッカーを切り替えます。</template>
			</MkSwitch>
			<MkSwitch v-model="showStarbutton">
				Clipボタンの代わりにStarリアクションボタンを表示する
				<template #caption>⭐ボタンをノートのフッターに表示します。</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import type { WritableComputedRef } from 'vue';
import { defaultStore } from '@/store.js';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';

const showStarbutton = ref(!defaultStore.state.showClipButtonInNoteFooter);

watchEffect(() => {
	defaultStore.set('showClipButtonInNoteFooter', showStarbutton.value);
});

const useOriginalInstanceTicker = computed(defaultStore.makeGetterSetter('useOriginalInstanceTicker')) as WritableComputedRef<boolean>;
</script>
