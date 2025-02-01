import { getAppUrl } from './base';

export function getShareUrl(token: string): string {
  return `${getAppUrl()}/shared/${token}`;
}