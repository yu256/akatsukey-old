import * as misskey from 'misskey-js';
import * as Acct from 'misskey-js/built/acct';
import { url } from '@/config';

export const acct = (user: misskey.Acct): string => Acct.toString(user);

export const userName = (user: misskey.entities.User): string => user.name || user.username;

export const userPage = (user: misskey.Acct, path?, absolute = false): string => `${absolute ? url : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
