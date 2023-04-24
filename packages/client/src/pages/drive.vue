<template>
<div>
	<XDrive ref="drive" @cd="x => folder = x"/>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import XDrive from '@/components/MkDrive.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let folder = $ref(null);

definePageMetadata(computed(() => ({
	title: folder ? folder.name : i18n.ts.drive,
	icon: 'ti ti-cloud',
	hideHeader: true,
})));
</script>
