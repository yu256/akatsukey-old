import { dateTimeFormat } from '@/scripts/intl-const';

export default (d: Date | number | undefined): string => dateTimeFormat.format(d); 
export const dateString = (d: string): string => dateTimeFormat.format(new Date(d));
