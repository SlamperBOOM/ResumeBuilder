import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { net, protocol } from 'electron';
import log from 'electron-log';
import { appScheme, bundleHost, localFileHost } from '../renderer/utils/consts';

const allowedImageExtensions = new Set(['.png', '.jpg', '.jpeg']);

/**
 * Must run before the app is ready: it makes `app://` behave like `https://`
 * (real origin, secure context, fetch/streaming support) instead of like an
 * opaque non-standard scheme.
 */
export function registerAppScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: appScheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
      },
    },
  ]);
}

export function resolveBundleFile(rendererRoot: string, pathname: string) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.join(rendererRoot, relative || 'index.html');

  return filePath.startsWith(rendererRoot + path.sep) ? filePath : null;
}

export function resolveLocalImage(pathname: string) {
  let filePath: string;
  try {
    filePath = fileURLToPath(`file://${pathname}`);
  } catch {
    return null;
  }

  return allowedImageExtensions.has(path.extname(filePath).toLowerCase())
    ? filePath
    : null;
}

export function handleAppProtocol() {
  const rendererRoot = path.join(__dirname, '../renderer');

  protocol.handle(appScheme, (request) => {
    const { host, pathname } = new URL(request.url);

    let filePath: string | null = null;
    if (host === bundleHost) {
      filePath = resolveBundleFile(rendererRoot, pathname);
    } else if (host === localFileHost) {
      filePath = resolveLocalImage(pathname);
    }

    if (!filePath) {
      log.warn(`[app-protocol] refused: ${request.url}`);
      return new Response('Forbidden', { status: 403 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}
