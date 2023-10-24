<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<VRCUser v-if="id" :id="id"/>
		<div v-else class="_gaps_m">
			<template v-if="profile">
				<FormInfo warn>プロフィールの情報は、このページ以外で書き換えを行うと次の情報の更新まで不整合が生じます。</FormInfo>
				<MkA :to="`/vrchat/${profile.id}`">詳細<i class="ti ti-external-link"/></MkA>
				<MkSelect v-model="profile.status">
					<option v-for="text in status" :key="text" :value="text">{{ text }}</option>
				</MkSelect>
				<MkInput v-model="profile.statusDescription" type="text" placeholder="statusDescription"/>
				<MkTextarea v-model="profile.bio" placeholder="bio"/>
				リンク
				<MkInput v-for="bioLink, index in profile.bioLinks" :key="bioLink" v-model="profile.bioLinks[index]" type="text" :placeholder="`リンク${index + 1}`"/>
				<div :class="$style.buttons">
					<MkButton
						inline
						@click="addLink"
					>
						リンクを追加
					</MkButton>
					<div/>
					<MkButton inline @click="updateProfile(profile)">
						更新
					</MkButton>
				</div>
			</template>
			<Search/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, shallowRef, triggerRef } from 'vue';
import VRCUser from './vrchat-user.vue';
import Search from '@/components/VrcSearchUser.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import MkTextarea from '@/components/MkTextarea.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import FormInfo from '@/components/MkInfo.vue';
import { status, fetchVrcWithAuth, User, updateProfile } from '@/scripts/vrchat-api';
import { defaultStore } from '@/store';

const props = defineProps<{
	id?: string;
}>();

const profile = shallowRef<User>();

props.id ?? fetchVrcWithAuth('user').then(user => {
	if (!user) return;
	VRChatId.value = user.id;
	profile.value = user;
});

function addLink(): void {
	profile.value?.bioLinks.push('');
	triggerRef(profile);
}

const VRChatId = computed<string>(defaultStore.makeGetterSetter('VRChatId'));

definePageMetadata({
	title: 'VRChat',
	icon: 'ti ti-badge-vr',
});
</script>

<style lang="scss" module>
.buttons {
	display: grid;
	grid-template-columns: 1fr 0.1fr 1fr;
}
</style>
