<template>
<MkContainer :showHeader="widgetProps.showHeader" class="mkw-userList">
	<template #icon><i class="ti ti-users"></i></template>
	<template #header>{{ i18n.ts._widgets.vrcUserList }}</template>
	<template #func="{ buttonStyleClass }"><button class="_button" :class="buttonStyleClass" @click="configure()"><i class="ti ti-settings"></i></button></template>

	<div :class="$style.root">
		<div v-if="!defaultStore.state.VRChatToken" class="init">
			<span>トークンを設定してください。</span>
		</div>
		<MkLoading v-else-if="fetching"/>
		<div v-else class="users">
			<span v-for="friend in friends" :key="friend.id" class="user">
				<VRCAvatar class="avatar" :friend="friend"/>
			</span>
		</div>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { useWidgetPropsManager, Widget, WidgetComponentExpose } from './widget';
import { GetFormResultType } from '@/scripts/form';
import MkContainer from '@/components/MkContainer.vue';
import { useInterval } from '@/scripts/use-interval';
import { getFriends, Friend } from '@/scripts/vrchat-api';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import VRCAvatar from '@/components/VrcAvatar.vue';

const name = 'vrcUserList';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		default: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const Props = defineProps<{ widget?: Widget<WidgetProps>; }>();
const emit = defineEmits<{ (ev: 'updateProps', props: WidgetProps); }>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	Props,
	emit,
);

let friends = $ref(<Friend[]>[]);
let fetching = $ref(true);

async function fetch(): Promise<void> {
	if (!defaultStore.state.VRChatToken) {
		fetching = false;
		return;
	}
	const res = await getFriends();
	friends = res.response;
	fetching = false;
}

useInterval(fetch, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: Props.widget ? Props.widget.id : null,
});
</script>

<style lang="scss" module>
.root {
	&:global {
		>.init {
			padding: 16px;
		}

		>.users {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(30px, 40px));
			grid-gap: 12px;
			place-content: center;
			padding: 16px;

			>.user {
				width: 100%;
				height: 100%;
				aspect-ratio: 1;

				>.avatar {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
}
</style>
	
