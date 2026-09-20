import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import ErrorBoundary from './screens/ErrorBoundary';
import logger from './utils/logger';
import { loadSettings } from './utils/settings';
import theme from './theme/theme';

logger.errorHandler.startCatching();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
async function start() {
  try {
    await loadSettings();
  } catch (error) {
    logger.error('Failed to load settings', error);
  }
  root.render(
    <ThemeProvider theme={theme} storageManager={null}>
      <CssBaseline enableColorScheme />
      <ErrorBoundary>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </ErrorBoundary>
    </ThemeProvider>,
  );
}

start();
