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

// Both schemes compile to CSS variables switched by prefers-color-scheme,
// which the main process controls through nativeTheme.themeSource.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: { palette: colors.light },
    dark: { palette: colors.dark },
  },
});

export default theme;
