import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import useSchemaApi from '../api/useSchemaApi';
import { AppActions } from '../utils/appActions';

type HeaderWrapperProps = {
  children: ReactNode;
  appActions: AppActions;
};

export default function HeaderWrapper(props: HeaderWrapperProps) {
  const { children, appActions } = props;

  const schemaApi = useSchemaApi();
  const [headerButtons, setHeaderButtons] = useState<Iterable<ReactNode>>([]);
  const [title, setTitle] = useState<string>();

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
                {schema.translations[element.key]}
              </Button>,
            );
          },
        );
        setTitle(schema.schema.app_title);
        setHeaderButtons(buttons);
        return null;
      })
      .catch((error) => {
        console.log(error);
      });
  }, [schemaApi, appActions]);

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
          <Typography variant="h4" marginRight={2}>
            {title}
          </Typography>
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
