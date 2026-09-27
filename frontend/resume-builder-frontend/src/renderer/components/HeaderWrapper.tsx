import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { ReactNode, useEffect, useState } from 'react';
import useSchemaApi from '../api/useSchemaApi';
import { AppActions } from '../utils/appActions';
import { translate } from '../utils/translations';
import appIcon from '../../../assets/icon.svg';
import logger from '../utils/logger';
import { setSetting } from '../utils/settings';

type HeaderWrapperProps = {
  children: ReactNode;
  appActions: AppActions;
};

export default function HeaderWrapper(props: HeaderWrapperProps) {
  const { children, appActions } = props;

  const schemaApi = useSchemaApi();
  const [headerButtons, setHeaderButtons] = useState<Iterable<ReactNode>>([]);
  const [title, setTitle] = useState<string>();
  const [themeLabels, setThemeLabels] = useState<{
    toDark: string;
    toLight: string;
  }>();
  const isDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });

  useEffect(() => {
    schemaApi
      .getHeader()
      .then((schema) => {
        const buttons: ReactNode[] = [];
        schema.schema.menu.forEach(
          (element: { key: string; action: string }) => {
            buttons.push(
              <Button
                key={element.key}
                onClick={() => {
                  appActions.performBduAction(element.action);
                }}
                color="inherit"
              >
                {translate(schema.translations, element.key)}
              </Button>,
            );
          },
        );
        setTitle(schema.schema.app_title);
        const themeToggle = schema.schema.theme_toggle;
        if (themeToggle) {
          setThemeLabels({
            toDark: translate(
              schema.translations,
              themeToggle.switch_to_dark_key,
            ),
            toLight: translate(
              schema.translations,
              themeToggle.switch_to_light_key,
            ),
          });
        }
        setHeaderButtons(buttons);
        return null;
      })
      .catch((error) => {
        logger.error('Failed to load header schema', error);
      });
  }, [schemaApi, appActions]);

  const themeLabel = isDark
    ? (themeLabels?.toLight ?? 'Toggle theme')
    : (themeLabels?.toDark ?? 'Toggle theme');

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <img src={appIcon} alt="" height="32px" />
          <Typography variant="h6" component="h1" marginRight={2}>
            {title}
          </Typography>
          <Tooltip title={themeLabel}>
            <IconButton
              color="inherit"
              aria-label={themeLabel}
              onClick={() => setSetting('themeMode', isDark ? 'light' : 'dark')}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          {headerButtons}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
