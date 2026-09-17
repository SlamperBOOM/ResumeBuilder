import path from 'node:path';
import { resolveBundleFile, resolveLocalImage } from '../../main/app-protocol';

jest.mock('electron', () => ({ net: {}, protocol: {} }));
jest.mock('electron-log', () => ({ warn: jest.fn() }));

const root = path.join(path.sep, 'app', 'renderer');
const picsDir = process.platform === 'win32' ? '/C:/pics' : '/pics';

describe('resolveBundleFile', () => {
  it('serves index.html for the root path', () => {
    expect(resolveBundleFile(root, '/')).toBe(path.join(root, 'index.html'));
  });

  it('serves a file inside the bundle', () => {
    expect(resolveBundleFile(root, '/style.css')).toBe(
      path.join(root, 'style.css'),
    );
  });

  it('refuses to escape the bundle directory', () => {
    expect(resolveBundleFile(root, '/../main/main.js')).toBeNull();
  });
});

describe('resolveLocalImage', () => {
  it('decodes percent-encoded path segments', () => {
    expect(resolveLocalImage(`${picsDir}/a%20b.png`)).toMatch(/a b\.png$/);
  });

  it('accepts an uppercase extension', () => {
    expect(resolveLocalImage(`${picsDir}/a.PNG`)).not.toBeNull();
  });

  it('refuses anything that is not an image', () => {
    expect(resolveLocalImage(`${picsDir}/passwords.txt`)).toBeNull();
  });
});
