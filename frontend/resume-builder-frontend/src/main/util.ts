/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

const frontendPort = process.env.PORT || 1212;

export function getFrontendPort() {
  return frontendPort;
}

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(`http://localhost:${frontendPort}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
