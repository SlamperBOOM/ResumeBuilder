export type PathValidationOptions = {
  allowedExtensions?: string[];
};

export function validatePickedPath(
  path: string | undefined | null,
  options: PathValidationOptions = {},
): boolean {
  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    return false;
  }

  // Plausible absolute path on Windows (`C:\...`, `C:/...`) or POSIX
  // (`/...`). The native dialog already restricts what a user can pick,
  // so this mainly catches a corrupted/unexpected response rather than
  // user intent.
  const isAbsolute = /^([a-zA-Z]:[\\/]|\/)/.test(path);
  if (!isAbsolute) {
    return false;
  }

  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const lower = path.toLowerCase();
    const matches = options.allowedExtensions.some((extension) =>
      lower.endsWith(extension.toLowerCase()),
    );
    if (!matches) {
      return false;
    }
  }

  return true;
}
