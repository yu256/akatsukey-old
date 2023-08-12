<template>
<div class="_gaps_m">
	<MkInfo>以下の機能はフォークの機能です。</MkInfo>
	<FormSection>
		<div class="_gaps_s">
			<MkSwitch v-model="useOriginalInstanceTicker">
				オリジナルのインスタンスティッカーを使用する
				<template #caption>インスタンスティッカーを切り替えます。</template>
			</MkSwitch>
			<MkSwitch v-model="useNumberquote">
				「パクる」と「数字引用」機能を有効にする
				<template #caption>Renoteメニューに「パクる」と「数字引用する」を追加します。</template>
			</MkSwitch>
			<MkSwitch v-model="disableAutostop">
				バックグラウンドでもタイムラインを更新する
				<template #caption>バックグラウンドで10秒経過したらページネーションのアイテム更新をしない機能を無効にします。</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';

const useNumberquote = computed<boolean>(defaultStore.makeGetterSetter('useNumberquote'));
const disableAutostop = computed<boolean>(defaultStore.makeGetterSetter('disableAutostop'));
const useOriginalInstanceTicker = computed<boolean>(defaultStore.makeGetterSetter('useOriginalInstanceTicker'));

</script>
