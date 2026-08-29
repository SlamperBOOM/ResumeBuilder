import axios from 'axios';
import { useCallback, useMemo } from 'react';
import type { ZodError, ZodType } from 'zod';

const REQUEST_TIMEOUT_MS = 15000;
let baseAddressPromise: Promise<string> | null = null;

function getBaseAddress(): Promise<string> {
  baseAddressPromise ??= window.electron
    .getBackendPort()
    .then((port) => `http://localhost:${port}/`);
  return baseAddressPromise;
}

export class ApiValidationError extends Error {
  readonly received: unknown;

  constructor(message: string, received: unknown) {
    super(message);
    this.name = 'ApiValidationError';
    this.received = received;
  }
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

function describeZodError(
  url: string,
  method: string,
  error: ZodError,
): string {
  const details = error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
  return `Unexpected response shape from ${method} ${url}: ${details}`;
}

async function performRequest<T = unknown>(
  method: 'get' | 'post' | 'delete',
  url: string,
  body: unknown,
  schema?: ZodType<unknown>,
): Promise<T> {
  try {
    const baseAddress = await getBaseAddress();
    const { data } = await axios.request({
      method,
      url: baseAddress + url,
      data: body,
      timeout: REQUEST_TIMEOUT_MS,
    });
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ApiValidationError(
          describeZodError(url, method, result.error),
          data,
        );
      }
      return result.data as T;
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiValidationError) throw error;
    throw new Error(extractErrorMessage(error));
  }
}

export default function useApi() {
  const performGetRequest = useCallback(
    async <T = unknown>(url: string, schema?: ZodType<unknown>): Promise<T> => {
      return performRequest('get', url, null, schema);
    },
    [],
  );

  const performPostRequest = useCallback(
    async <T = unknown>(
      url: string,
      body: unknown,
      schema?: ZodType<unknown>,
    ): Promise<T> => {
      return performRequest('post', url, body, schema);
    },
    [],
  );

  const performDeleteRequest = useCallback(
    async <T = unknown>(url: string, schema?: ZodType<unknown>): Promise<T> => {
      return performRequest('delete', url, schema);
    },
    [],
  );

  return useMemo(() => {
    return {
      performGetRequest,
      performPostRequest,
      performDeleteRequest,
    };
  }, [performGetRequest, performPostRequest, performDeleteRequest]);
}
