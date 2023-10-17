<!-- eslint-disable vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<VRCUser v-if="id" :id="id"/>
		<div v-else class="_gaps_m">
			<MkInput v-model="VRChatId" type="text" placeholder="自分のユーザーID"/>
			<template v-if="profile">
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
			<MkButton
				v-else
				@click="VRChatId && fetchVrcWithAuth('user', VRChatId).then(user => profile = user)"
			>
				プロフィールを取得
			</MkButton>
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
import { status, fetchVrc, fetchVrcWithAuth, User } from '@/scripts/vrchat-api';
import { defaultStore } from '@/store';
import { toast } from '@/os';

const profile = shallowRef<User>();

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

function addLink(): void {
	profile.value?.bioLinks.push('');
	triggerRef(profile);
}

function updateProfile(): void {
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
