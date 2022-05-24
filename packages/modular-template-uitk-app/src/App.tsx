import * as React from 'react';
import { Card, Panel, Link } from '@jpmorganchase/uitk-lab';
import { Button, ToolkitProvider } from '@jpmorganchase/uitk-core';
import { AddIcon, RemoveIcon } from '@jpmorganchase/uitk-icons';
import { Nav } from './components/Nav';

import './App.css';

const App = (): JSX.Element => {
  const [selectedTheme, setSelectedTheme] = React.useState<'light' | 'dark'>(
    'light',
  );

  const [count, setCount] = React.useState(0);
  return (
    <ToolkitProvider theme={selectedTheme}>
      <div className="App">
        <Nav
          theme={selectedTheme}
          onThemeChange={(newTheme) => setSelectedTheme(newTheme)}
        />
        <Panel>
          <Card>
            <h1>Welcome to your new app!</h1>
          </Card>
        </Panel>
        <Panel>
          <Card>
            <h2>
              Check UITK's{' '}
              <Link
                href="https://ui-toolkit-staging.pages.dev/"
                target="_blank"
              >
                storybook
              </Link>{' '}
              and{' '}
              <Link
                href="https://github.com/jpmorganchase/uitk"
                target="_blank"
              >
                GitHub
              </Link>
            </h2>
          </Card>
        </Panel>
        <Panel>
          <Card>
            <h1>
              <Button onClick={() => setCount((x) => x - 1)}>
                <RemoveIcon />
              </Button>{' '}
              Counter {count}{' '}
              <Button onClick={() => setCount((x) => x + 1)}>
                <AddIcon />
              </Button>
            </h1>
          </Card>
        </Panel>
      </div>
    </ToolkitProvider>
  );
};

export default App;
