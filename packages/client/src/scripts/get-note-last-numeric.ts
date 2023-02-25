const ENDS_WITH_NUMERIC = /-?\d+$/;

export function getTextLastNumeric(text: string): number {
	const result = ENDS_WITH_NUMERIC.exec(text);
	// 数字がない場合は暗黙的に1とみなす
	if (!result) return 1;
	return parseInt(result[0]);
}

export function getTextWithoutEndingNumeric(text: string): string {
	return text.replace(ENDS_WITH_NUMERIC, '');
}
