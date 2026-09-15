import { renderHook } from '@testing-library/react';
import useActionApi, {
  BDU_ACTION_UPDATE,
} from '../../renderer/api/useActionApi';
import {
  actionResponseSchema,
  optionalActionResponseSchema,
} from '../../renderer/api/apiSchemasValidation';
import { UpdatePayload } from '../../renderer/utils/backendTypes';
import logger from '../../renderer/utils/logger';

const mockPerformGetRequest = jest.fn();
const mockPerformPostRequest = jest.fn();
const mockPerformDeleteRequest = jest.fn();

jest.mock('../../renderer/api/useApi', () => ({
  __esModule: true,
  default: () => ({
    performGetRequest: mockPerformGetRequest,
    performPostRequest: mockPerformPostRequest,
    performDeleteRequest: mockPerformDeleteRequest,
  }),
}));

beforeEach(() => {
  mockPerformGetRequest.mockReset();
  mockPerformPostRequest.mockReset();
  mockPerformDeleteRequest.mockReset();
  (window as unknown as { electron: Record<string, jest.Mock> }).electron = {
    openSaveFileDialog: jest.fn(),
    openFileDialog: jest.fn(),
  };
});

describe('useActionApi', () => {
  it('dispatches a GET action with no payload', async () => {
    mockPerformGetRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });

    const { result } = renderHook(() => useActionApi());
    await result.current.about();

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'action/about',
      actionResponseSchema,
    );
  });

  it('dispatches a POST action with a payload-derived url', async () => {
    mockPerformPostRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });

    const { result } = renderHook(() => useActionApi());
    await result.current.locale({ locale: 'en' });

    expect(mockPerformPostRequest).toHaveBeenCalledWith(
      'action/locale/set/en',
      null,
      actionResponseSchema,
    );
  });

  it('rejects a POST action with an invalid payload before making a request', async () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useActionApi());
    const data = await result.current.locale({});

    expect(data).toBeNull();
    expect(mockPerformPostRequest).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No locale set');

    warnSpy.mockRestore();
  });

  it('dispatches a DELETE action for a resume id', async () => {
    mockPerformDeleteRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });

    const { result } = renderHook(() => useActionApi());
    await result.current.delete({ resume_id: 'r1' });

    expect(mockPerformDeleteRequest).toHaveBeenCalledWith(
      'action/delete/r1',
      actionResponseSchema,
    );
  });

  it('builds the request body for the update action', async () => {
    mockPerformPostRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });
    const updatePayload: UpdatePayload = {
      resume_id: 'r1',
      resume_info: {
        resume_name: 'My resume',
        resume_locale: 'en',
        template_name: 'modern',
      },
      content: [],
    };

    const { result } = renderHook(() => useActionApi());
    await result.current[BDU_ACTION_UPDATE]({ update_payload: updatePayload });

    expect(mockPerformPostRequest).toHaveBeenCalledWith(
      'action/update',
      updatePayload,
      actionResponseSchema,
    );
  });

  it('uses the optional response schema for actions marked optionalResponse', async () => {
    mockPerformGetRequest.mockResolvedValue(null);

    const { result } = renderHook(() => useActionApi());
    await result.current.open_save_dir();

    expect(mockPerformGetRequest).toHaveBeenCalledWith(
      'action/open_save_dir',
      optionalActionResponseSchema,
    );
  });

  it('exports through the save-file dialog and posts a valid path', async () => {
    (window.electron.openSaveFileDialog as jest.Mock).mockResolvedValue(
      'C:\\resumes\\out.pdf',
    );
    mockPerformPostRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });

    const { result } = renderHook(() => useActionApi());
    await result.current.export({ resume_id: 'r1', resume_name: 'My resume' });

    expect(window.electron.openSaveFileDialog).toHaveBeenCalledWith(
      'My resume',
    );
    expect(mockPerformPostRequest).toHaveBeenCalledWith(
      'action/export',
      { resume_id: 'r1', save_path: 'C:\\resumes\\out.pdf' },
      actionResponseSchema,
    );
  });

  it('rejects an exported path with a disallowed extension', async () => {
    (window.electron.openSaveFileDialog as jest.Mock).mockResolvedValue(
      'C:\\resumes\\out.docx',
    );
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useActionApi());
    const data = await result.current.export({ resume_id: 'r1' });

    expect(data).toBeNull();
    expect(mockPerformPostRequest).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('imports through the file dialog and posts the chosen file', async () => {
    (window.electron.openFileDialog as jest.Mock).mockResolvedValue(
      'C:\\resumes\\in.json',
    );
    mockPerformPostRequest.mockResolvedValue({
      frontend_action: 'update_current_screen',
    });

    const { result } = renderHook(() => useActionApi());
    await result.current.import();

    expect(mockPerformPostRequest).toHaveBeenCalledWith(
      'action/import',
      { file_name: 'C:\\resumes\\in.json' },
      actionResponseSchema,
    );
  });
});
