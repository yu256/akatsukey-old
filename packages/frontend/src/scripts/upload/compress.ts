/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import isAnimated from 'is-file-animated';

export async function createImageData(file: File): Promise<ImageData> {
	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();

		image.onload = () => {
			URL.revokeObjectURL(image.src);
			resolve(image);
		};

		image.onerror = reject;

		image.src = URL.createObjectURL(file);
	});

	const cv = document.createElement('canvas');
	[cv.width, cv.height] = [img.naturalWidth, img.naturalHeight];
	const ctx = cv.getContext('2d');
	ctx!.drawImage(img, 0, 0);
	return ctx!.getImageData(0, 0, cv.width, cv.height);
}

export const compressTypes = {
	'image/jpeg': 'jpeg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
} as const;

export async function shouldBeCompressed(file: File): Promise<boolean> {
	return (compressTypes[file.type] && !await isAnimated(file));
}
