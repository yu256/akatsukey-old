<template>
<div class="_panel">
	<div v-if="user" :class="$style.container">
		<div :class="$style.avatarContainer">
			<VrcAvatar :class="$style.avatar" :user="user"/>
		</div>
		<div :class="$style.bodyContainer">
			<div :class="$style.body">
				<MkA :to="`/vrchat/${user.id}`">
					{{ user.displayName }}
				</MkA>
				<MkSelect v-model="user.status">
					<option v-for="text in status" :key="text" :value="text">{{ text }}</option>
				</MkSelect>
			</div>
		</div>
	</div>
	<MkLoading v-else/>
</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget';
import { GetFormResultType } from '@/scripts/form';
import { fetchVrcWithAuth, User, status, updateProfile } from '@/scripts/vrchat-api';
import VrcAvatar from '@/components/VrcAvatar.vue';
import MkSelect from '@/components/MkSelect.vue';

const name = 'profile';

const user = ref<User>();
fetchVrcWithAuth('user').then(r => user.value = r);

const widgetPropsDef = {};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

// eslint-disable-next-line vue/no-setup-props-destructure
defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});

let isLoaded = false;
watch(user, () => {
	if (isLoaded) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		updateProfile(user.value!);
	} else if (user.value) {
		isLoaded = true;
	}
}, { deep: true });

</script>

<style lang="scss" module>
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
