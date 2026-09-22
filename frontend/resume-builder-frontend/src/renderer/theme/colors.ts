// The single place for app colors, per theme. Components reference palette
// tokens ('background.paper', 'text.secondary', 'surface.editor', ...), never
// raw values. Import-free on purpose: main.ts uses the background colors
// without bundling MUI.
// The values below are MUI's own defaults, spelled out so they can be tuned
// here. The help page gets them too, through HelpDialog.tsx.

export const colors = {
  // C2 — Catppuccin (Latte / Mocha)
  light: {
    primary: { main: '#117a80' },
    error: { main: '#d20f39' },
    background: { default: '#eff1f5', paper: '#ffffff' },
    text: { primary: '#4c4f69', secondary: '#6c6f85', disabled: '#9ca0b0' },
    divider: '#dce0e8',
    surface: {
      editor: '#e6e9ef',
      cardPreview: '#dce0e8',
      pdfBackdrop: '#ccd0da',
    },
  },
  dark: {
    primary: { main: '#94e2d5' },
    error: { main: '#f38ba8' },
    background: { default: '#181825', paper: '#1e1e2e' },
    text: { primary: '#cdd6f4', secondary: '#a6adc8', disabled: '#6c7086' },
    divider: '#313244',
    surface: {
      editor: '#11111b',
      cardPreview: '#313244',
      pdfBackdrop: '#45475a',
    },
  },
};

export default colors;
