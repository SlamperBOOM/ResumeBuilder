import axios from 'axios';
import { useCallback, useMemo } from 'react';
import type { ZodError, ZodType } from 'zod';
import { backendPort } from '../utils/consts';

const REQUEST_TIMEOUT_MS = 15000;

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

export default function useApi() {
  const baseAddress = `http://localhost:${backendPort}/`;

  const performGetRequest = useCallback(
    async <T = unknown>(url: string, schema?: ZodType<unknown>): Promise<T> => {
      try {
        const { data } = await axios.get(baseAddress + url, {
          timeout: REQUEST_TIMEOUT_MS,
        });
        if (schema) {
          const result = schema.safeParse(data);
          if (!result.success) {
            throw new ApiValidationError(
              describeZodError(url, 'GET', result.error),
              data,
            );
          }
          return result.data as T;
        }
        return data as T;
      } catch (error) {
        if (error instanceof ApiValidationError) {
          throw error;
        }
        throw new Error(extractErrorMessage(error));
      }
    },
    [baseAddress],
  );

  const performPostRequest = useCallback(
    async <T = unknown>(
      url: string,
      body: unknown,
      schema?: ZodType<unknown>,
    ): Promise<T> => {
      try {
        const { data } = await axios.post(baseAddress + url, body, {
          timeout: REQUEST_TIMEOUT_MS,
        });
        if (schema) {
          const result = schema.safeParse(data);
          if (!result.success) {
            throw new ApiValidationError(
              describeZodError(url, 'POST', result.error),
              data,
            );
          }
          return result.data as T;
        }
        return data as T;
      } catch (error) {
        if (error instanceof ApiValidationError) {
          throw error;
        }
        throw new Error(extractErrorMessage(error));
      }
    },
    [baseAddress],
  );

  const performDeleteRequest = useCallback(
    async <T = unknown>(url: string, schema?: ZodType<unknown>): Promise<T> => {
      try {
        const { data } = await axios.delete(baseAddress + url, {
          timeout: REQUEST_TIMEOUT_MS,
        });
        if (schema) {
          const result = schema.safeParse(data);
          if (!result.success) {
            throw new ApiValidationError(
              describeZodError(url, 'DELETE', result.error),
              data,
            );
          }
          return result.data as T;
        }
        return data as T;
      } catch (error) {
        if (error instanceof ApiValidationError) {
          throw error;
        }
        throw new Error(extractErrorMessage(error));
      }
    },
    [baseAddress],
  );

  return useMemo(() => {
    return {
      performGetRequest,
      performPostRequest,
      performDeleteRequest,
    };
  }, [performGetRequest, performPostRequest, performDeleteRequest]);
}
