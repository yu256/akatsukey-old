<template>
<div 
	class="drylbebk"
	:class="{ draghover }"
	@click="onClick"
	@dragover.prevent.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<i v-if="folder == null" class="ti ti-cloud"></i>
	<span>{{ folder == null ? i18n.ts.drive : folder.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { parseObject } from '@/scripts/tms/parse';

const props = defineProps<{
	folder?: Misskey.entities.DriveFolder;
	parentFolder: Misskey.entities.DriveFolder | null;
}>();

const emit = defineEmits<{
	(ev: 'move', v?: Misskey.entities.DriveFolder): void;
	(ev: 'upload', file: File, folder?: Misskey.entities.DriveFolder | null): void;
	(ev: 'removeFile', v: Misskey.entities.DriveFile['id']): void;
	(ev: 'removeFolder', v: Misskey.entities.DriveFolder['id']): void;
}>();

const draghover = ref(false);

const onClick = (): void => emit('move', props.folder);

const onDragover = (ev: DragEvent): boolean | undefined => {
	if (!ev.dataTransfer) return;

	// このフォルダがルートかつカレントディレクトリならドロップ禁止
	if (props.folder == null && props.parentFolder == null) {
		ev.dataTransfer.dropEffect = 'none';
	}

	const isFile = ev.dataTransfer.items[0].kind === 'file';
	const isDriveFile = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FILE_;
	const isDriveFolder = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FOLDER_;

	if (isFile || isDriveFile || isDriveFolder) {
		switch (ev.dataTransfer.effectAllowed) {
			case 'all':
			case 'uninitialized':
			case 'copy': 
			case 'copyLink': 
			case 'copyMove': 
				ev.dataTransfer.dropEffect = 'copy';
				break;
			case 'linkMove':
			case 'move':
				ev.dataTransfer.dropEffect = 'move';
				break;
			default:
				ev.dataTransfer.dropEffect = 'none';
				break;
		}
	} else {
		ev.dataTransfer.dropEffect = 'none';
	}

	return false;
};

const onDragenter = (): void => {
	if (props.folder || props.parentFolder) draghover.value = true;
};

const onDragleave = (): void => {
	if (props.folder || props.parentFolder) draghover.value = false;
};

const onDrop = (ev: DragEvent): void => {
	draghover.value = false;

	if (!ev.dataTransfer) return;

	// ファイルだったら
	if (ev.dataTransfer.files.length > 0) {
		for (const file of Array.from(ev.dataTransfer.files)) {
			emit('upload', file, props.folder);
		}
		return;
	}

	//#region ドライブのファイル
	const driveFile = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
	if (driveFile != null && driveFile !== '') {
		const file = parseObject<Misskey.entities.DriveFile>(driveFile);
		emit('removeFile', file.id);
		os.api('drive/files/update', {
			fileId: file.id,
			folderId: props.folder ? props.folder.id : null
		});
	}
	//#endregion

	//#region ドライブのフォルダ
	const driveFolder = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FOLDER_);
	if (driveFolder != null && driveFolder !== '') {
		const folder = parseObject<Misskey.entities.DriveFolder>(driveFolder);
		// 移動先が自分自身ならreject
		if (props.folder && folder.id === props.folder.id) return;
		emit('removeFolder', folder.id);
		os.api('drive/folders/update', {
			folderId: folder.id,
			parentId: props.folder ? props.folder.id : null
		});
	}
	//#endregion
};
</script>

<style lang="scss" scoped>
.drylbebk {
	> * {
		pointer-events: none;
	}

	&.draghover {
		background: #eee;
	}

	> i {
		margin-right: 4px;
	}
}
</style>
