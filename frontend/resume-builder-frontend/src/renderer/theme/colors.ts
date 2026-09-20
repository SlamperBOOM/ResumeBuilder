// The single place for app colors, per theme. Components reference palette
// tokens ('background.paper', 'text.secondary', 'surface.editor', ...), never
// raw values. Import-free on purpose: main.ts uses the background colors
// without bundling MUI.
// The values below are MUI's own defaults, spelled out so they can be tuned
// here. The dark ones are mirrored by hand in backend templates/help_page.html.

export const colors = {
  light: {
    primary: { main: '#1976d2' },
    error: { main: '#d32f2f' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    surface: {
      editor: '#f5f7fa', // EditScreen backdrop
      cardPreview: '#eef2f6', // ResumeCard preview area
      pdfBackdrop: '#eeeeee', // area around the rendered PDF page
    },
  },
  dark: {
    primary: { main: '#90caf9' },
    error: { main: '#f44336' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    surface: {
      editor: '#181a1f',
      cardPreview: '#23272e',
      pdfBackdrop: '#2b2b2b',
    },
  },
};

export default colors;
