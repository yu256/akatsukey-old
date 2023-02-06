<template>
<XModalWindow
	ref="dialogEl"
	:width="800"
	:height="500"
	:scroll="false"
	:with-ok-button="true"
	@close="cancel()"
	@ok="ok()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.cropImage }}</template>
	<template #default="{ width, height }">
		<div class="mk-cropper-dialog" :style="`--vw: ${width}px; --vh: ${height}px;`">
			<Transition name="fade">
				<div v-if="loading" class="loading">
					<MkLoading/>
				</div>
			</Transition>
			<div class="container">
				<img ref="imgEl" :src="imgUrl" style="display: none;" @load="onImageLoad">
			</div>
		</div>
	</template>
</XModalWindow>
</template>

<script lang="ts" setup>
import { nextTick, onMounted } from 'vue';
import * as misskey from 'misskey-js';
import Cropper from 'cropperjs';
import tinycolor from 'tinycolor2';
import XModalWindow from '@/components/MkModalWindow.vue';
import * as os from '@/os';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import { apiUrl, url } from '@/config';
import { query } from '@/scripts/url';
import { i18n } from '@/i18n';

const emit = defineEmits<{
	(ev: 'ok', cropped: misskey.entities.DriveFile): void;
	(ev: 'cancel'): void;
	(ev: 'closed'): void;
}>();

const props = defineProps<{
	file: misskey.entities.DriveFile;
	aspectRatio: number;
	highDefinition: boolean;
}>();

const imgUrl = `${url}/proxy/image.webp?${query({
	url: props.file.url,
})}`;
let dialogEl = $ref<InstanceType<typeof XModalWindow>>();
let imgEl = $ref<HTMLImageElement>();
let cropper: Cropper | null = null;
let loading = $ref(true);
let highDefinition = props.highDefinition ?? false; //もともとのコードでは存在しないので

const ok = async () => {
	const promise = new Promise<misskey.entities.DriveFile>(async (res) => { 
		let croppedCanvas = await cropper?.getCropperSelection()?.$toCanvas();
		if ( highDefinition ) { //TODO: 2回も取得してるの効率悪すぎるのでなんとかする
			croppedCanvas = await cropper?.getCropperSelection()?.$toCanvas({
				width: 4096,
				height: 4096,
			});
		}
		if (croppedCanvas == null) {
			throw new Error('croppedCanvas is null'); //ここで蹴らないと警告が出るので, あとでエラーちゃんと出すようにする
		}
		croppedCanvas.toBlob(blob => {
			const formData = new FormData();
			formData.append('file', blob);
			formData.append('i', $i.token);
			if (defaultStore.state.uploadFolder) {
				formData.append('folderId', defaultStore.state.uploadFolder);
			}

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: formData,
			})
			.then(response => response.json())
			.then(f => {
				res(f);
			});
		},
		'image/jpeg', 1); //TODO: オプションにする(これだと意図しない場所にjpgを渡しちゃうかも？、アイコンがjpgでもいいと思うけど)
	});

	os.promiseDialog(promise);

	const f = await promise;

	emit('ok', f);
	dialogEl.close();
};

const cancel = () => {
	emit('cancel');
	dialogEl.close();
};

const onImageLoad = () => {
	loading = false;

	if (cropper) {
			cropper.getCropperImage()!.$center('contain');
			cropper.getCropperSelection()!.$center();
	}
};

onMounted(() => {
	cropper = new Cropper(imgEl, {
	});

	const computedStyle = getComputedStyle(document.documentElement);

	const selection = cropper.getCropperSelection()!;
	selection.themeColor = tinycolor(computedStyle.getPropertyValue('--accent')).toHexString();
	selection.aspectRatio = props.aspectRatio;
	selection.initialAspectRatio = props.aspectRatio;
	selection.outlined = true;

	window.setTimeout(() => {
		cropper.getCropperImage()!.$center('contain');
		selection.$center();
	}, 100);

	// モーダルオープンアニメーションが終わったあとで再度調整
	window.setTimeout(() => {
		cropper.getCropperImage()!.$center('contain');
		selection.$center();
	}, 500);
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease 0.5s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.mk-cropper-dialog {
	display: flex;
	flex-direction: column;
	width: var(--vw);
	height: var(--vh);
	position: relative;

	> .loading {
		position: absolute;
		z-index: 10;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		-webkit-backdrop-filter: var(--blur, blur(10px));
		backdrop-filter: var(--blur, blur(10px));
		background: rgba(0, 0, 0, 0.5);
	}

	> .container {
		flex: 1;
		width: 100%;
		height: 100%;

		> ::v-deep(cropper-canvas) {
			width: 100%;
			height: 100%;

			> cropper-selection > cropper-handle[action="move"] {
				background: transparent;
			}
		}
	}
}
</style>
