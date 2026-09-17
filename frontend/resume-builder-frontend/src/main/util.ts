/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import { appOrigin } from '../renderer/utils/consts';

const frontendPort = process.env.PORT || 1212;

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(`http://localhost:${frontendPort}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `${appOrigin}/${htmlFileName}`;
}
