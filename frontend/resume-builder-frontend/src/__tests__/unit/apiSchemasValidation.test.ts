import {
  actionResponseSchema,
  optionalActionResponseSchema,
  schemaResponseSchema,
  templatesResponseSchema,
} from '../../renderer/api/apiSchemasValidation';
import FrontendActionEnum from '../../renderer/frontendAction/FrontendActionEnum';

describe('actionResponseSchema', () => {
  it('accepts a valid action response', () => {
    const result = actionResponseSchema.safeParse({
      frontend_action: FrontendActionEnum.SHOW_MESSAGE,
      payload: { text: 'hi' },
    });

    expect(result.success).toBe(true);
  });

  it('accepts a response without a payload', () => {
    const result = actionResponseSchema.safeParse({
      frontend_action: FrontendActionEnum.CLOSE,
    });

    expect(result.success).toBe(true);
  });

  it('keeps unknown extra fields via passthrough', () => {
    const result = actionResponseSchema.safeParse({
      frontend_action: FrontendActionEnum.CLOSE,
      extra_backend_field: 'kept',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.extra_backend_field).toBe('kept');
    }
  });

  it('rejects a frontend_action outside the enum', () => {
    const result = actionResponseSchema.safeParse({
      frontend_action: 'NOT_A_REAL_ACTION',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a response missing frontend_action', () => {
    const result = actionResponseSchema.safeParse({ payload: {} });

    expect(result.success).toBe(false);
  });
});

describe('optionalActionResponseSchema', () => {
  it('treats an empty string as no action', () => {
    const result = optionalActionResponseSchema.safeParse('');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('treats undefined as no action', () => {
    const result = optionalActionResponseSchema.safeParse(undefined);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('still validates a real action response', () => {
    const result = optionalActionResponseSchema.safeParse({
      frontend_action: FrontendActionEnum.OPEN_MAIN_SCREEN,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a malformed non-empty value', () => {
    const result = optionalActionResponseSchema.safeParse({
      frontend_action: 'nope',
    });

    expect(result.success).toBe(false);
  });
});

describe('schemaResponseSchema', () => {
  it('accepts a well-formed schema response', () => {
    const result = schemaResponseSchema.safeParse({
      schema: { field_a: { type: 'text_input' } },
      translations: { field_a: 'Field A' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects translations with non-string values', () => {
    const result = schemaResponseSchema.safeParse({
      schema: {},
      translations: { field_a: 123 },
    });

    expect(result.success).toBe(false);
  });

  it('rejects a response missing schema', () => {
    const result = schemaResponseSchema.safeParse({ translations: {} });

    expect(result.success).toBe(false);
  });
});

describe('templatesResponseSchema', () => {
  it('accepts a valid templates response', () => {
    const result = templatesResponseSchema.safeParse({
      payload: [{ name: 'Modern', preview: 'base64-or-url' }],
      schema: {},
    });

    expect(result.success).toBe(true);
  });

  it('rejects a template entry missing a name', () => {
    const result = templatesResponseSchema.safeParse({
      payload: [{ preview: 'x' }],
      schema: {},
    });

    expect(result.success).toBe(false);
  });

  it('rejects when payload is not an array', () => {
    const result = templatesResponseSchema.safeParse({
      payload: {},
      schema: {},
    });

    expect(result.success).toBe(false);
  });
});
