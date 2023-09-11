<template>
<MkContainer :showHeader="widgetProps.showHeader" class="mkw-userList">
	<template #icon><i class="ti ti-users"></i></template>
	<template #header>{{ i18n.ts._widgets.vrcUserList }}</template>
	<template #func="{ buttonStyleClass }"><button class="_button" :class="buttonStyleClass" @click="configure()"><i class="ti ti-settings"></i></button></template>

	<div :class="$style.root">
		<div v-if="!defaultStore.state.VRChatAuth" class="init">
			<MkA to="/settings/vrchat">トークンを設定してください。</MkA>
		</div>
		<MkLoading v-else-if="!friends"/>
		<template v-else-if="friends.public.length || friends.private.length">
			<span v-if="friends.public.length" class="users">
				<span v-for="friend in friends.public" :key="friend.id" class="user">
					<VRCAvatar class="avatar" :friend="friend"/>
				</span>
			</span>
			<div v-else class="init">
				パブリックのフレンドはいません。
			</div>
			<template v-if="friends.private.length">
				<div :class="$style.divider"/>
				<span class="users">
					<span v-for="friend in friends.private" :key="friend.id" class="user">
						<VRCAvatar class="avatar" :friend="friend"/>
					</span>
				</span>
			</template>
		</template>
		<div v-else class="init">
			<span>オンラインのフレンドがいません。</span>
		</div>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import { useWidgetPropsManager, Widget, WidgetComponentExpose } from './widget';
import { GetFormResultType } from '@/scripts/form';
import MkContainer from '@/components/MkContainer.vue';
import { useInterval } from '@/scripts/use-interval';
import { fetchData, Friend } from '@/scripts/vrchat-api';
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

const friends = shallowRef<{
		'public': Friend[];
		'private': Friend[];
	}>();

async function fetch(): Promise<void> {
	if (!defaultStore.state.VRChatAuth) return;

	friends.value = await fetchData('friends', defaultStore.state.VRChatAuth);
}

useInterval(fetch, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

const widgetId = Props.widget?.id ?? null;

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: widgetId,
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

.divider {
	border-top: solid 0.5px var(--divider);
}
</style>

