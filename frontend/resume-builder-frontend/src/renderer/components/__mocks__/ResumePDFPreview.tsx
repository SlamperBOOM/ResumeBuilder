// Shared Jest manual mock, enabled in a test file with
// jest.mock('<path>/components/ResumePDFPreview') and no factory.
// The real module can't be loaded under ts-jest (import.meta, see
// TESTING_PLAN.md), so the enum is copied - keep it in sync with the real one.

export enum ResumePreviewScaleEnum {
  FULL_WIDTH = 'full_width',
  FULL_HEIGHT = 'full_height',
  CUSTOM = 'custom',
}

export default function ResumePDFPreview() {
  return <div data-testid="mock-pdf-preview" />;
}
