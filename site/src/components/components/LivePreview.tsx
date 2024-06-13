import {
  FC,
  ChangeEvent,
  useState,
  ReactNode,
  ReactElement,
  useEffect,
  ElementType,
} from "react";
import clsx from "clsx";
import { Button, Switch } from "@salt-ds/core";
import { SaltProvider } from "@salt-ds/core";
import { Pre } from "../mdx/pre";
import { useLivePreviewControls } from "./useLivePreviewControls";
import useIsMobileView from "../../utils/useIsMobileView";
import StackBlitzSDK from "@stackblitz/sdk";

import styles from "./LivePreview.module.css";

type LivePreviewProps = {
  componentName: string;
  exampleName: string;

  /**
   * Text label that will be used for this example in the list view in place
   * of an auto-generated one based on the `exampleName`.
   *
   * Should ideally match the H3 text in the description content that
   * accompanies this example (provided via the `children` prop).
   */
  displayName?: string;
  list?: ReactElement;
  children?: ReactNode;
};

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
  list,
  children,
}) => {
  const [ownShowCode, setOwnShowCode] = useState<boolean>(false);

  const isMobileView = useIsMobileView();

  const [ComponentExample, setComponentExample] = useState<{
    Example?: ElementType;
    sourceCode: string;
  }>({
    Example: undefined,
    sourceCode: "",
  });
  useEffect(() => {
    async function fetchExample() {
      const Example = (
        (await import(`../../examples/${componentName}`)) as Record<
          string,
          ElementType
        >
      )[exampleName];
      const sourceCode = (
        (await import(
          `!!raw-loader!../../examples/${componentName}/${exampleName}.tsx`
        )) as Record<string, string>
      ).default;

      return { Example, sourceCode };
    }

    fetchExample()
      .then((data) => setComponentExample(data))
      .catch((e) => console.error(`Failed to load example ${exampleName}`, e));
  }, [exampleName, componentName]);

  const {
    density,
    mode,
    showCode: contextShowCode,
    onShowCodeToggle: contextOnShowCodeToggle,
  } = useLivePreviewControls();

  const handleShowCodeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const newShowCode = event.target.checked;
    if (contextOnShowCodeToggle) {
      // Context is controlling the show code state
      contextOnShowCodeToggle(newShowCode);
    } else {
      setOwnShowCode(newShowCode);
    }
  };

  // If no context is provided (e.g. <LivePreview> is being used standalone
  // somewhere), then fallback to using own state
  const showCode = contextOnShowCodeToggle ? contextShowCode : ownShowCode;

  const editInStackBlitz = () => {
    const PACKAGE_JSON = {
      name: "react-ts",
      version: "0.0.0",
      private: true,
      dependencies: {
        "@fontsource/open-sans": "^4.5.13",
        "@fontsource/pt-mono": "^4.5.11",
        "@salt-ds/core": "latest",
        "@salt-ds/countries": "latest",
        "@salt-ds/icons": "latest",
        "@salt-ds/lab": "latest",
        "@salt-ds/theme": "latest",
        "@types/react": "^18.3.0",
        "@types/react-dom": "^18.3.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
      },
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
        test: "react-scripts test --env=jsdom",
        eject: "react-scripts eject",
      },
      devDependencies: {
        "react-scripts": "latest",
      },
    };
    StackBlitzSDK.openProject(
      // Payload
      {
        // REQUIRED: specify dependencies
        dependencies: PACKAGE_JSON.dependencies,
        files: {
          "index.html": `<div id="root"></div>`,
          "index.tsx": `import * as React from 'react';
          import { StrictMode } from 'react';
          import { createRoot } from 'react-dom/client';
          
          import '@salt-ds/theme/index.css';
          import '@fontsource/open-sans/300.css';
          import '@fontsource/open-sans/300-italic.css';
          import '@fontsource/open-sans/400.css';
          import '@fontsource/open-sans/400-italic.css';
          import '@fontsource/open-sans/500.css';
          import '@fontsource/open-sans/500-italic.css';
          import '@fontsource/open-sans/600.css';
          import '@fontsource/open-sans/600-italic.css';
          import '@fontsource/open-sans/700.css';
          import '@fontsource/open-sans/700-italic.css';
          import '@fontsource/open-sans/800.css';
          import '@fontsource/open-sans/800-italic.css';
          import '@fontsource/pt-mono';
          
          import App from './App';
          import { SaltProvider } from '@salt-ds/core';
          
          const rootElement = document.getElementById('root');
          const root = createRoot(rootElement);
          
          root.render(
            <StrictMode>
              <SaltProvider>
                <App />
              </SaltProvider>
            </StrictMode>
          );
          `,
          "App.tsx":
            `import * as React from 'react';
` +
            ComponentExample.sourceCode +
            `
          
          export default ${exampleName};
          `,
          // Recommended: provide a package.json file with the same dependencies
          "package.json": JSON.stringify(PACKAGE_JSON, null, 2),
        },
        // EngineBlock
        template: "create-react-app",
        title: `Salt example`,
        description: `This is an example of salt component`,
      },
      // Options
      {
        newWindow: true,
        openFile: "App.tsx",
      }
    );
  };

  return (
    <>
      {children}
      <div className={styles.container}>
        <div
          className={clsx(styles.componentPreview, {
            [styles.smallViewport]: isMobileView,
          })}
        >
          {list && list}
          <SaltProvider mode={mode}>
            <div className={styles.exampleWithSwitch}>
              <div className={styles.example}>
                <SaltProvider density={density}>
                  {ComponentExample.Example && <ComponentExample.Example />}
                </SaltProvider>
              </div>
              <SaltProvider density="medium">
                <Switch
                  checked={showCode}
                  onChange={handleShowCodeToggle}
                  className={styles.switch}
                  label="Show code"
                />
              </SaltProvider>
            </div>
          </SaltProvider>
        </div>

        {showCode && (
          <>
            <Pre className={styles.codePreview}>
              <div className="language-tsx">{ComponentExample.sourceCode}</div>
            </Pre>
            <Button onClick={editInStackBlitz}>Edit in StackBlitz</Button>
          </>
        )}
      </div>
    </>
  );
};
