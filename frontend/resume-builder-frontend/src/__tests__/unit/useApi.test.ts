import { renderHook } from '@testing-library/react';
import axios from 'axios';
import { z } from 'zod';
import useApi, { ApiValidationError } from '../../renderer/api/useApi';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// getBaseAddress() caches the backend port at module scope, so a test that
// needs the cache empty gets its own copy of the module. React and axios are
// pinned to the copies this file already uses: a second React would break
// the hooks, a second axios mock would hide the calls.
function loadUseApiWithEmptyPortCache(): typeof useApi {
  const reactModule = jest.requireActual('react');
  const axiosModule = jest.requireMock('axios');
  let freshUseApi!: typeof useApi;
  jest.isolateModules(() => {
    jest.doMock('react', () => reactModule);
    jest.doMock('axios', () => axiosModule);
    freshUseApi = jest.requireActual<
      typeof import('../../renderer/api/useApi')
    >('../../renderer/api/useApi').default;
  });
  return freshUseApi;
}

beforeEach(() => {
  mockedAxios.request.mockReset();
  (window as unknown as { electron: { getBackendPort: jest.Mock } }).electron =
    { getBackendPort: jest.fn().mockResolvedValue(3000) };
});

describe('useApi', () => {
  it('rejects without calling the backend when window.electron is unavailable', async () => {
    const freshUseApi = loadUseApiWithEmptyPortCache();
    delete (window as { electron?: unknown }).electron;

    const { result } = renderHook(() => freshUseApi());

    await expect(result.current.performGetRequest('ping')).rejects.toThrow();
    expect(mockedAxios.request).not.toHaveBeenCalled();
  });

  it('returns parsed data for a schema-valid response', async () => {
    mockedAxios.request.mockResolvedValueOnce({ data: { ok: true } });
    const schema = z.object({ ok: z.boolean() });

    const { result } = renderHook(() => useApi());
    const data = await result.current.performGetRequest('ping', schema);

    expect(data).toEqual({ ok: true });
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: 'http://localhost:3000/ping',
      }),
    );
  });

  it('throws ApiValidationError for a response that fails schema validation', async () => {
    mockedAxios.request.mockResolvedValueOnce({
      data: { ok: 'not-a-boolean' },
    });
    const schema = z.object({ ok: z.boolean() });

    const { result } = renderHook(() => useApi());

    await expect(
      result.current.performGetRequest('ping', schema),
    ).rejects.toBeInstanceOf(ApiValidationError);
  });

  it('wraps a network/axios error with its message', async () => {
    mockedAxios.request.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useApi());

    await expect(result.current.performGetRequest('ping')).rejects.toThrow(
      'Network Error',
    );
  });

  it('validates a DELETE response against the passed schema and sends no body', async () => {
    mockedAxios.request.mockResolvedValueOnce({ data: { deleted: 'yes' } });
    const schema = z.object({ deleted: z.boolean() });

    const { result } = renderHook(() => useApi());

    await expect(
      result.current.performDeleteRequest('resume/1', schema),
    ).rejects.toBeInstanceOf(ApiValidationError);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'delete', data: null }),
    );
  });

  it('skips validation for a DELETE request without a schema', async () => {
    mockedAxios.request.mockResolvedValueOnce({ data: { deleted: true } });

    const { result } = renderHook(() => useApi());
    const data = await result.current.performDeleteRequest('resume/1');

    expect(data).toEqual({ deleted: true });
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'delete',
        url: 'http://localhost:3000/resume/1',
        data: null,
      }),
    );
  });
});
