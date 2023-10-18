<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<VRCUser v-if="id" :id="id"/>
		<div v-else class="_gaps_m">
			<template v-if="profile">
				<FormInfo warn>プロフィールの情報は、このページ以外で書き換えを行うと次の情報の更新まで不整合が生じます。</FormInfo>
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
					<MkButton inline @click="updateProfile">
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
import { status, fetchVrc, fetchVrcWithAuth, User } from '@/scripts/vrchat-api';
import { defaultStore } from '@/store';
import { toast } from '@/os';

const profile = shallowRef<User>();

fetchVrcWithAuth('user').then(user => profile.value = user);

function addLink(): void {
	profile.value?.bioLinks.push('');
	triggerRef(profile);
}

function updateProfile(): void {
	type Profile = {
		auth: string,
		user: string,
		query: {
			status: string,
			statusDescription: string,
			bio: string,
			bioLinks: string[],
			userIcon?: string,
		}
	}

	if (!profile.value) return;

	const req = {
		auth: defaultStore.state.VRChatAuth,
		user: VRChatId.value,
		query: {
			status: profile.value.status,
			statusDescription: profile.value.statusDescription ?? '',
			bio: profile.value.bio,
			bioLinks: profile.value.bioLinks,
			userIcon: profile.value.hasUserIcon ? profile.value.currentAvatarThumbnailImageUrl : undefined,
		},
	} as const satisfies Profile;

	fetchVrc('profile', req).then(ok => ok && toast('✅'));
}

const VRChatId = computed<string>(defaultStore.makeGetterSetter('VRChatId'));

defineProps<{
	id?: string;
}>();

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
