// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { TextEncoder, TextDecoder } from 'node:util';
import webpackPaths from '../configs/webpack.paths';

const mainPath = path.join(webpackPaths.distMainPath, 'main.js');
const rendererPath = path.join(webpackPaths.distRendererPath, 'renderer.js');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "npm run build:main"',
    ),
  );
}

if (!fs.existsSync(rendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The renderer process is not built yet. Build it by running "npm run build:renderer"',
    ),
  );
}

// JSDOM does not implement TextEncoder and TextDecoder
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// JSDOM does not implement IntersectionObserver, which ResumeCard uses to
// render a page preview once the sheet is within reach. The stub reports every
// observed sheet as visible, so tests see the fully loaded grid.
type IntersectionStubCallback = (
  entries: { isIntersecting: boolean; target: unknown }[],
) => void;

if (!global.IntersectionObserver) {
  global.IntersectionObserver = function IntersectionObserverStub(
    callback: IntersectionStubCallback,
  ) {
    return {
      root: null,
      rootMargin: '',
      thresholds: [],
      observe: (target: unknown) =>
        callback([{ isIntersecting: true, target }]),
      unobserve: () => {},
      disconnect: () => {},
      takeRecords: () => [],
    };
  } as unknown as typeof global.IntersectionObserver;
}

// JSDOM does not implement ResizeObserver, used by react-resizable-panels
// and a few components (ResumeTemplateField, ResumePDFPreview)
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
}
