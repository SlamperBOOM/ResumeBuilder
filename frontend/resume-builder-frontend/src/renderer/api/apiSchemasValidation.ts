import { z } from 'zod';
import FrontendActionEnum from '../frontendAction/FrontendActionEnum';

// Runtime schemas validating the shape of backend responses at the API
// boundary (useApi.ts). Kept intentionally loose (`.passthrough()`,
// `z.unknown()` for the BDUI schema/payload trees) - we only assert the
// fields this app actually relies on, not the full backend contract, so
// a legitimate backend addition doesn't start failing validation here.

export const actionResponseSchema = z
  .object({
    frontend_action: z.enum(FrontendActionEnum),
    payload: z.unknown().optional(),
  })
  .passthrough();

export const optionalActionResponseSchema = z.preprocess(
  (val) => (val === '' || val === undefined ? null : val),
  actionResponseSchema.nullable(),
);

export const schemaResponseSchema = z
  .object({
    schema: z.record(z.string(), z.unknown()),
    translations: z.record(z.string(), z.string()),
    payload: z.unknown().optional(),
  })
  .passthrough();

export const templatesResponseSchema = z
  .object({
    payload: z.array(
      z
        .object({
          name: z.string(),
          preview: z.string(),
        })
        .passthrough(),
    ),
    schema: z.record(z.string(), z.unknown()),
  })
  .passthrough();
