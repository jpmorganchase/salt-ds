import { SaltProviderNext, Switch, useId } from "@salt-ds/core";
import { SaltProvider } from "@salt-ds/core";
import {
  type ChangeEvent,
  type ElementType,
  type FC,
  useEffect,
  useState,
} from "react";
import { Pre } from "../mdx/pre";
import { useLivePreviewControls } from "./LivePreviewProvider";

import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/lab";
import styles from "./LivePreview.module.css";

type LivePreviewProps = {
  componentName: string;
  exampleName: string;
};

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
}) => {
  const [showCode, setShowCode] = useState<boolean>(false);

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

  return (
    <div className={styles.container}>
      <div className={styles.componentPreview}>
        <LocalizationProvider DateAdapter={AdapterDateFns}>
          <div className={styles.exampleWithSwitch}>
            <ChosenSaltProvider
              mode={mode}
              accent="teal"
              corner="rounded"
              headingFont="Amplitude"
              actionFont="Amplitude"
            >
              <div className={styles.example}>
                <ChosenSaltProvider density={density} mode={mode}>
                  {ComponentExample.Example && <ComponentExample.Example />}
                </ChosenSaltProvider>
              </div>
            </ChosenSaltProvider>
            <SaltProviderNext density="medium" applyClassesTo="child">
              <div className={styles.toolbar}>
                <Switch
                  checked={showCode}
                  onChange={handleShowCodeToggle}
                  className={styles.switch}
                  label="Show code"
                  aria-controls={panelId}
                />
              </div>
            </SaltProviderNext>
          </div>
        </LocalizationProvider>
      </div>

      <div
        className={styles.codePanel}
        aria-hidden={!showCode}
        hidden={!showCode}
        id={panelId}
      >
        <div className={styles.codePanelInner}>
          <Pre className={styles.codePreview}>
            <div className="language-tsx">
              {ComponentExample.sourceCode.trimEnd()}
            </div>
          </Pre>
        </div>
      </div>
    </div>
  );
};
