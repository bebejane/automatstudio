import { format } from 'date-fns';
export const isServer = typeof window === 'undefined';
export const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd')