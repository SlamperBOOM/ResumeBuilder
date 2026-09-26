import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewControls from '../../renderer/components/resume_edit/PreviewControls';
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
  it('renders the mode options and the current scale', () => {
    renderControls({ previewScale: 0.5 });

    expect(
      screen.getByRole('button', { name: 'Full width' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Full height' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('marks the option matching the current preview mode', () => {
    renderControls({ previewMode: ResumePreviewScaleEnum.CUSTOM });

    expect(screen.getByRole('button', { name: 'Custom' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Full width' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onPreviewModeChange when a different mode is selected', () => {
    const { onPreviewModeChange } = renderControls({
      previewMode: ResumePreviewScaleEnum.FULL_HEIGHT,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Full width' }));

    expect(onPreviewModeChange).toHaveBeenCalledWith(
      ResumePreviewScaleEnum.FULL_WIDTH,
    );
  });

  it('disables the zoom stepper unless the mode is Custom', () => {
    renderControls({ previewMode: ResumePreviewScaleEnum.FULL_HEIGHT });

    expect(screen.getByRole('button', { name: 'Scale +' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Scale −' })).toBeDisabled();
  });

  it('steps the scale by 10% in Custom mode', () => {
    const { onPreviewScaleChange } = renderControls({
      previewMode: ResumePreviewScaleEnum.CUSTOM,
      previewScale: 0.5,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Scale +' }));
    expect(onPreviewScaleChange).toHaveBeenCalledWith(0.6);

    fireEvent.click(screen.getByRole('button', { name: 'Scale −' }));
    expect(onPreviewScaleChange).toHaveBeenCalledWith(0.4);
  });

  it('stops the stepper at the ends of the range', () => {
    const { rerender } = render(
      <PreviewControls
        scaleTitle="Scale"
        fullWidthLabel="Full width"
        fullHeightLabel="Full height"
        customLabel="Custom"
        previewMode={ResumePreviewScaleEnum.CUSTOM}
        onPreviewModeChange={jest.fn()}
        previewScale={1}
        onPreviewScaleChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Scale +' })).toBeDisabled();

    rerender(
      <PreviewControls
        scaleTitle="Scale"
        fullWidthLabel="Full width"
        fullHeightLabel="Full height"
        customLabel="Custom"
        previewMode={ResumePreviewScaleEnum.CUSTOM}
        onPreviewModeChange={jest.fn()}
        previewScale={0.1}
        onPreviewScaleChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Scale −' })).toBeDisabled();
  });
});
