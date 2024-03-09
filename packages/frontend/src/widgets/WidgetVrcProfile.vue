<template>
<div class="_panel">
	<MkA to="settings/vrchat" :class="$style.setting">
		<i class="ti ti-settings"/>
	</MkA>
	<div v-if="user" :class="$style.container">
		<div :class="$style.avatarContainer">
			<VrcAvatar :class="$style.avatar" :user="user"/>
		</div>
		<div :class="$style.bodyContainer">
			<div :class="$style.body">
				<MkA :to="`/vrchat/${user.id}`">
					{{ user.displayName }}
				</MkA>
				<MkSelect v-model="currentStatus">
					<option v-for="text in customStatus" :key="text" :value="text">{{ text.replace('_', ' ') }}</option>
				</MkSelect>
			</div>
		</div>
	</div>
	<MkLoading v-else/>
</div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue';
import { defaultStore } from '@/store.js';
import { fetchVrcWithAuth, updateProfile, User } from '@/scripts/vrchat-api.js';
import VrcAvatar from '@/components/VrcAvatar.vue';
import MkSelect from '@/components/MkSelect.vue';

const currentStatus = ref('');
const user = shallowRef<User>();

const customStatus = defaultStore.state.VRChatStatusSets.map(getStatus);

function getStatus(status: [string, string]): string {
	return `${status[0]}${status[1] && `_${status[1]}`}`;
}

fetchVrcWithAuth('user', {}).then(res => {
	if (!res) return;
	const status = getStatus([res.status, res.statusDescription ?? '']);
	if (!customStatus.includes(status)) customStatus.unshift(status);
	currentStatus.value = status;
	setTimeout(() => {
		user.value = res;
	}, 10);
});

watch(currentStatus, () => {
	if (!user.value) return;
	const [status, desc] = currentStatus.value.split('_');
	user.value.status = status as 'join me' | 'active' | 'ask me' | 'busy';
	user.value.statusDescription = desc || ''; // 本当は??にしたいがTSがnullishであると認識していない(undefinedの可能性がある)
	updateProfile(user.value);
});

</script>

<style lang="scss" module>
.setting {
	position: fixed;
	right: 1em;
	top: 1em;
	z-index: 10;
}

.container {
	position: relative;
	background-size: cover;
	background-position: center;
	display: flex;
}

.avatarContainer {
	display: inline-block;
	text-align: center;
	padding: 16px;
}

.avatar {
	display: inline-block;
	width: 60px;
	height: 60px;
	box-sizing: border-box;
	border: solid 3px #fff;
}

.bodyContainer {
	display: flex;
	align-items: center;
	min-width: 0;
	padding: 0 16px 0 0;
}

.body {
	text-overflow: ellipsis;
	overflow: clip;
}

.name {
	color: #fff;
	filter: drop-shadow(0 0 4px #000);
	font-weight: bold;
}
</style>
