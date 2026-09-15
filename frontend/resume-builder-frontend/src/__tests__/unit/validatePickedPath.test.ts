import { validatePickedPath } from '../../renderer/api/validatePickedPath';

describe('validatePickedPath', () => {
  it('rejects undefined and null', () => {
    expect(validatePickedPath(undefined)).toBe(false);
    expect(validatePickedPath(null)).toBe(false);
  });

  it('rejects an empty or whitespace-only string', () => {
    expect(validatePickedPath('')).toBe(false);
    expect(validatePickedPath('   ')).toBe(false);
  });

  it('rejects a relative path', () => {
    expect(validatePickedPath('resumes/photo.png')).toBe(false);
  });

  it('accepts an absolute Windows path with backslashes', () => {
    expect(validatePickedPath('C:\\Users\\slava\\photo.png')).toBe(true);
  });

  it('accepts an absolute Windows path with forward slashes', () => {
    expect(validatePickedPath('C:/Users/slava/photo.png')).toBe(true);
  });

  it('accepts an absolute POSIX path', () => {
    expect(validatePickedPath('/home/slava/photo.png')).toBe(true);
  });

  describe('with allowedExtensions', () => {
    it('accepts a path with a matching extension, case-insensitively', () => {
      expect(
        validatePickedPath('C:\\photos\\avatar.PNG', {
          allowedExtensions: ['.png', '.jpg'],
        }),
      ).toBe(true);
    });

    it('rejects a path with a non-matching extension', () => {
      expect(
        validatePickedPath('C:\\photos\\avatar.gif', {
          allowedExtensions: ['.png', '.jpg'],
        }),
      ).toBe(false);
    });

    it('ignores the extension check when the allow-list is empty', () => {
      expect(
        validatePickedPath('C:\\photos\\avatar.gif', {
          allowedExtensions: [],
        }),
      ).toBe(true);
    });
  });
});
