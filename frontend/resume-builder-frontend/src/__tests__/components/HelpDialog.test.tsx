import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import HelpDialog from '../../renderer/dialogs/HelpDialog';
import theme from '../../renderer/theme/theme';
import { colors } from '../../renderer/theme/colors';
import { makeDialogActions } from '../../testUtils/appActions';

describe('HelpDialog', () => {
  it('passes the app theme colors to the help page for both schemes', () => {
    render(
      <ThemeProvider theme={theme}>
        <HelpDialog
          showState
          schema={{
            title: 'Help',
            html: '<html><head><title>Help</title></head><body>text</body></html>',
          }}
          dialogActions={makeDialogActions()}
        />
      </ThemeProvider>,
    );

    const srcDoc = screen.getByTitle('Help').getAttribute('srcdoc') ?? '';
    const style = srcDoc.slice(
      srcDoc.indexOf('<style>'),
      srcDoc.indexOf('</head>'),
    );
    const darkAt = style.indexOf('prefers-color-scheme: dark');

    expect(
      style.indexOf(`--accent:${colors.light.primary.main};`),
    ).toBeLessThan(darkAt);
    expect(
      style.indexOf(`--accent:${colors.dark.primary.main};`),
    ).toBeGreaterThan(darkAt);
    expect(style).toContain(`--surface:${colors.dark.surface.editor};`);
    expect(srcDoc).toContain('<body>text</body>');
  });
});
