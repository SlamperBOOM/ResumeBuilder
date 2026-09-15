import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewControls from '../../renderer/components/PreviewControls';
import { ResumePreviewScaleEnum } from '../../renderer/components/ResumePDFPreview';

jest.mock('../../renderer/components/ResumePDFPreview');

function renderControls(
  overrides: Partial<Parameters<typeof PreviewControls>[0]> = {},
) {
  const onPreviewModeChange = jest.fn();
  const onPreviewScaleChange = jest.fn();
  render(
    <PreviewControls
      scaleTitle="Scale"
      fullWidthLabel="Full width"
      fullHeightLabel="Full height"
      customLabel="Custom"
      previewMode={ResumePreviewScaleEnum.FULL_HEIGHT}
      onPreviewModeChange={onPreviewModeChange}
      previewScale={0.5}
      onPreviewScaleChange={onPreviewScaleChange}
      {...overrides}
    />,
  );
  return { onPreviewModeChange, onPreviewScaleChange };
}

describe('PreviewControls', () => {
  it('renders the labels and exposes the current scale on the slider', () => {
    renderControls({ previewScale: 0.5 });

    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Full width' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Full height' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Scale' })).toHaveAttribute(
      'aria-valuetext',
      '50%',
    );
  });

  it('checks the radio matching the current preview mode', () => {
    renderControls({ previewMode: ResumePreviewScaleEnum.CUSTOM });

    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Full width' })).not.toBeChecked();
  });

  it('calls onPreviewModeChange when a different mode is selected', () => {
    const { onPreviewModeChange } = renderControls({
      previewMode: ResumePreviewScaleEnum.FULL_HEIGHT,
    });

    fireEvent.click(screen.getByRole('radio', { name: 'Full width' }));

    expect(onPreviewModeChange).toHaveBeenCalledWith(
      ResumePreviewScaleEnum.FULL_WIDTH,
    );
  });

  it('disables the slider unless the mode is Custom', () => {
    renderControls({ previewMode: ResumePreviewScaleEnum.FULL_HEIGHT });

    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('enables the slider when the mode is Custom', () => {
    renderControls({ previewMode: ResumePreviewScaleEnum.CUSTOM });

    expect(screen.getByRole('slider')).toBeEnabled();
  });
});
