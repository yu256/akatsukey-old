<template>
<MkInput v-model="query"/>
<MkButton @click="search">決定</MkButton>
<div v-if="users" class="_gaps_s">
	<VrcUser v-for="user in users" :key="user.displayName" :user="user"/>
</div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import VrcUser from './VrcUser.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import { HitUsers, fetchDataWithAuth } from '@/scripts/vrchat-api';

let query = '';
const users = shallowRef<HitUsers>();

async function search(): Promise<void> {
	users.value = await fetchDataWithAuth('search_user', query);
}
</script>
