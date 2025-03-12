import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { SaltProvider, SaltProviderNext, Switch, useId } from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/lab";
import clsx from "clsx";
import {
  type ChangeEvent,
  type ElementType,
  type FC,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import useIsMobileView from "../../utils/useIsMobileView";
import styles from "./LivePreview.module.css";
import { useLivePreviewControls } from "./useLivePreviewControls";

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

const exportConst = "export const ";
const addExportDefaultToSource = (source: string) => {
  const fromExportName = source.substring(
    source.lastIndexOf(exportConst) + exportConst.length,
  );
  const exportName = fromExportName.substring(0, fromExportName.indexOf(" "));
  return `${source.replaceAll(exportConst, "const ")}\nexport default ${exportName};\n`;
};

const APP_SOURCE_LEGACY = `import React from "react";
import { SaltProvider } from "@salt-ds/core";
import Example from "./Example";

import "@salt-ds/theme/index.css";
// import "@salt-ds/theme/css/theme-next.css";

import "./App.css";

export default () => {
  return (
    <SaltProvider density="DENSITY" mode="MODE">
      <div className="example">
        <Example/>
      </div>
    </SaltProvider>
  );
};
`;
const APP_SOURCE_BRAND = `import React from "react";
import { SaltProviderNext } from "@salt-ds/core";
import Example from "./Example";

import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/theme-next.css";

import "./App.css";

export default () => {
  return (
    <SaltProviderNext
      density="DENSITY"
      mode="MODE"
      accent="teal"
      corner="rounded"
      headingFont="Amplitude"
      actionFont="Amplitude"
    >
      <div className="example">
        <Example/>
      </div>
    </SaltProviderNext>
  );
};
`;

const customFiles = {
  "/Example.tsx": { code: `export default () => "Loading";`, active: true },
  "/App.tsx": {
    code: APP_SOURCE_LEGACY,
    hidden: true,
  },
  "/index.tsx": {
    code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/300-italic.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/500-italic.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/800.css";
import "@fontsource/open-sans/800-italic.css";
import "@fontsource/pt-mono";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
    hidden: true,
  },
  "/public/index.html": {
    code: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
</head>
<body>
<div id="root"></div>
</body>
</html>`,
    hidden: true,
  },
  "/App.css": {
    code: `
.example {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--salt-spacing-200);
  padding-top: var(--salt-spacing-300);
}`,
    hidden: true,
  },
};

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
  children,
}) => {
  const [showCode, setShowCode] = useState<boolean>(false);

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
          `../../examples/${componentName}/${exampleName}.tsx?raw`
        )) as Record<string, string>
      ).default;

      return { Example, sourceCode };
    }

    fetchExample()
      .then((data) => setComponentExample(data))
      .catch((e) => console.error(`Failed to load example ${exampleName}`, e));
  }, [exampleName, componentName]);

  const { density, mode, theme } = useLivePreviewControls();

  const handleShowCodeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const newShowCode = event.target.checked;
    setShowCode(newShowCode);
  };

  const ChosenSaltProvider =
    theme === "brand" ? SaltProviderNext : SaltProvider;

  const panelId = useId();

  const files = useMemo(() => {
    return {
      ...customFiles,
      "/App.tsx": {
        code: (theme === "brand" ? APP_SOURCE_BRAND : APP_SOURCE_LEGACY)
          .replace("DENSITY", density || "medium")
          .replace("MODE", mode || "light"),
        hidden: true,
      },
      "/Example.tsx": ComponentExample.sourceCode
        ? {
            code: addExportDefaultToSource(ComponentExample.sourceCode),
            active: true,
          }
        : customFiles["/Example.tsx"],
    };
  }, [ComponentExample.sourceCode, theme, density, mode]);

  return (
    <>
      {children}
      <div className={styles.container}>
        <div
          className={clsx(styles.componentPreview, {
            [styles.smallViewport]: isMobileView,
          })}
        >
          <LocalizationProvider DateAdapter={AdapterDateFns}>
            <ChosenSaltProvider
              mode={mode}
              accent="teal"
              corner="rounded"
              headingFont="Amplitude"
              actionFont="Amplitude"
            >
              <div className={styles.exampleWithSwitch}>
                <div className={styles.example}>
                  <ChosenSaltProvider density={density}>
                    {ComponentExample.Example && <ComponentExample.Example />}
                  </ChosenSaltProvider>
                </div>
                <ChosenSaltProvider density="medium">
                  <Switch
                    checked={showCode}
                    onChange={handleShowCodeToggle}
                    className={styles.switch}
                    label="Show code"
                    aria-controls={panelId}
                  />
                </ChosenSaltProvider>
              </div>
            </ChosenSaltProvider>
          </LocalizationProvider>
        </div>

        {showCode ? (
          ComponentExample.sourceCode ? (
            <SandpackProvider
              theme={mode}
              template="react-ts"
              customSetup={{
                // fontsource doesn't work in preview, load open sans using externalResources
                dependencies: {
                  "@fontsource/open-sans": "^4.5.13",
                  "@fontsource/pt-mono": "^5.0.12",
                  "@salt-ds/core": "latest",
                  "@salt-ds/theme": "latest",
                },
              }}
              files={files}
              options={{
                externalResources: [
                  "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=PT+Mono&display=swap",
                ],
              }}
            >
              <SandpackLayout>
                <SandpackCodeEditor />
                <SandpackPreview />
              </SandpackLayout>
            </SandpackProvider>
          ) : (
            "Loading source code"
          )
        ) : null}
      </div>
    </>
  );
};
