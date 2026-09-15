import { renderHook } from '@testing-library/react';
import useSchemaApi from '../../renderer/api/useSchemaApi';
import {
  schemaResponseSchema,
  templatesResponseSchema,
} from '../../renderer/api/apiSchemasValidation';

const mockPerformGetRequest = jest.fn();

jest.mock('../../renderer/api/useApi', () => ({
  __esModule: true,
  default: () => ({ performGetRequest: mockPerformGetRequest }),
}));

beforeEach(() => {
  mockPerformGetRequest.mockReset();
});

describe('useSchemaApi', () => {
  it('requests the header schema', async () => {
    mockPerformGetRequest.mockResolvedValue({ schema: {}, translations: {} });

    const { result } = renderHook(() => useSchemaApi());
    await result.current.getHeader();

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'schema/header',
      schemaResponseSchema,
    );
  });

  it('requests the language dialog schema', async () => {
    mockPerformGetRequest.mockResolvedValue({ schema: {}, translations: {} });

    const { result } = renderHook(() => useSchemaApi());
    await result.current.getLanguageDialog();

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'schema/language_dialog',
      schemaResponseSchema,
    );
  });

  it('requests the edit screen schema for the given resume id', async () => {
    mockPerformGetRequest.mockResolvedValue({ schema: {}, translations: {} });

    const { result } = renderHook(() => useSchemaApi());
    await result.current.getEditScreen('resume 1');

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'schema/edit_screen/resume%201',
      schemaResponseSchema,
    );
  });

  it('requests templates with the templates schema', async () => {
    mockPerformGetRequest.mockResolvedValue({ payload: [], schema: {} });

    const { result } = renderHook(() => useSchemaApi());
    await result.current.getTemplates('resume-1');

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'schema/templates/resume-1',
      templatesResponseSchema,
    );
  });

  it('returns the resolved data from the underlying request', async () => {
    const response = { schema: {}, translations: { key: 'value' } };
    mockPerformGetRequest.mockResolvedValue(response);

    const { result } = renderHook(() => useSchemaApi());
    const data = await result.current.getMainScreen();

    expect(data).toEqual(response);
  });

  it('propagates errors from the underlying request', async () => {
    mockPerformGetRequest.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useSchemaApi());

    await expect(result.current.getMainScreen()).rejects.toThrow('boom');
  });
});
