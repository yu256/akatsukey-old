<template>
<MkContainer :showHeader="widgetProps.showHeader" class="mkw-userList">
	<template #icon><i class="ti ti-users"></i></template>
	<template #header>{{ list ? list.name : i18n.ts._widgets.userList }}</template>
	<template #func="{ buttonStyleClass }"><button class="_button" :class="buttonStyleClass" @click="configure()"><i class="ti ti-settings"></i></button></template>

	<div :class="$style.root">
		<div v-if="widgetProps.listId == null" class="init">
			<MkButton primary @click="chooseList">{{ i18n.ts._widgets._userList.chooseList }}</MkButton>
		</div>
		<MkLoading v-else-if="fetching"/>
		<div v-else class="users">
			<span v-for="user in users" :key="user.id" class="user">
				<MkAvatar v-if="!widgetProps.onlyOnline || user.onlineStatus === 'online'" :user="user" class="avatar" indicator link preview/>
			</span>
		</div>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { UserDetailed, UserList } from 'misskey-js/built/entities';
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget';
import { GetFormResultType } from '@/scripts/form';
import MkContainer from '@/components/MkContainer.vue';
import * as os from '@/os';
import { useInterval } from '@/scripts/use-interval';
import { i18n } from '@/i18n';
import MkButton from '@/components/MkButton.vue';

const name = 'userList';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		default: true,
	},
	listId: {
		type: 'string' as const,
		default: null,
		hidden: true,
	},
	onlyOnline: {
		type: 'boolean' as const,
		default: false,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure, save } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

let list = $ref<UserList>();
let users = $ref<UserDetailed[]>([]);
let fetching = $ref(true);

async function chooseList(): Promise<void> {
	const lists = await os.api('users/lists/list');
	const { canceled, result: __list } = await os.select({
		title: i18n.ts.selectList,
		items: lists.map(x => ({
			value: x, text: x.name,
		})),
		default: widgetProps.listId,
	});
	if (canceled) return;

	widgetProps.listId = __list.id;
	save();
	fetch();
}

function fetch(): void {
	if (widgetProps.listId as string | null == null) {
		fetching = false;
		return;
	}

	os.api('users/lists/show', {
		listId: widgetProps.listId,
	}).then(_list => {
		list = _list;
		os.api('users/show', {
			userIds: list.userIds,
		}).then(_users => {
			users = _users as unknown as UserDetailed[];
			fetching = false;
		});
	});
}

useInterval(fetch, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

// eslint-disable-next-line vue/no-setup-props-destructure
defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" module>
.root {
	&:global {
		> .init {
			padding: 16px;
		}

		> .users {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(30px, 40px));
			grid-gap: 12px;
			place-content: center;
			padding: 16px;

			> .user {
				width: 100%;
				height: 100%;
				aspect-ratio: 1;

				> .avatar {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
}
</style>
