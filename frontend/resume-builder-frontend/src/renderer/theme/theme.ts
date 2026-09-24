import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

type Surface = typeof colors.light.surface;

declare module '@mui/material/styles' {
  interface Palette {
    surface: Surface;
  }
  interface PaletteOptions {
    surface?: Surface;
  }
  // Types theme.colorSchemes, which cssVariables below does produce
  interface CssThemeVariables {
    enabled: true;
  }
}

// Inter ships with the app; the @font-face lives in App.css. The fallbacks are
// the closest metric match per platform, and only show if the bundled file
// fails to load.
const fontFamily = [
  '"Inter Variable"',
  'Inter',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(', ');

// One ramp, 48/40/32/28/22/18/16/14/12/11, with tracking tightening as size
// grows: Inter is drawn on the loose side for small text, so large sizes need
// the negative tracking and small sizes need none.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: { palette: colors.light },
    dark: { palette: colors.dark },
  },
  typography: {
    fontFamily,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    // 600, not 700: at UI sizes Inter's bold is heavier than this interface
    // ever needs to be.
    fontWeightBold: 600,

    h1: {
      fontSize: '3rem',
      fontWeight: 650,
      lineHeight: 1.1,
      letterSpacing: '-0.028em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 650,
      lineHeight: 1.15,
      letterSpacing: '-0.026em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.022em',
    },
    // Display: the rare large moment — never chrome.
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    // Headline: dialog titles, empty-state headings.
    h5: {
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.016em',
    },
    // Title: the workhorse — resume names, section and screen headings.
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.012em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '-0.008em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: '-0.004em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: '-0.008em',
    },
    // Supporting text, and every timestamp in the app: lining figures would
    // make a grid of cards ripple, tabular ones line up.
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '-0.004em',
      fontVariantNumeric: 'tabular-nums',
    },
    // Sentence case. The uppercase button label was MUI's default, not a
    // decision this interface made, and it costs Russian labels their shape.
    button: {
      fontSize: '0.875rem',
      fontWeight: 550,
      lineHeight: 1.4,
      letterSpacing: '0',
      textTransform: 'none',
    },
    // Eyebrow: section labels in the block rail. Uppercase needs tracking back.
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1.6,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
    },
    // Counts and positional readouts, so they hold still while they change.
    caption: {
      fontSize: '0.75rem',
      fontWeight: 450,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  components: {
    MuiDialogContentText: {
      styleOverrides: {
        // Prose stays inside a comfortable measure however wide the dialog is.
        root: { maxWidth: '68ch' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        // Field labels are read, not scanned; the shrunk label was inheriting
        // display tracking at 12px, where Inter needs none.
        root: { letterSpacing: '-0.004em' },
      },
    },
  },
});

export default theme;
