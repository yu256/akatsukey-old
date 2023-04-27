import { numberFormat } from '@/scripts/intl-const';

export default (n: number | bigint | null): string => n == null ? 'N/A' : numberFormat.format(n);
