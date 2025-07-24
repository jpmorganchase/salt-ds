import { useColorMode } from "@jpmorganchase/mosaic-store";
import { SaltProvider, SaltProviderNext, Switch, useId } from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { LocalizationProvider } from "@salt-ds/lab";
import {
  type ChangeEvent,
  type ElementType,
  type FC,
  useEffect,
  useState,
} from "react";
import { Pre } from "../mdx/pre";
import styles from "./LivePreview.module.css";
import { useLivePreviewControls } from "./LivePreviewProvider";

type LivePreviewProps = {
  componentName: string;
  exampleName: string;
};

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
}) => {
  const siteMode = useColorMode();
  const [showCode, setShowCode] = useState<boolean>(false);

  const [ComponentExample, setComponentExample] = useState<{
    Example?: ElementType;
    sourceCode: string;
  }>({
    Example: undefined,
    sourceCode: "",
  });
  useEffect(() => {
    async function prepare() {
      const fetchExample = (await import("./fetchExample")).default;

      fetchExample(componentName, exampleName)
        .then((data) => setComponentExample(data))
        .catch((e) =>
          console.error(`Failed to load example ${exampleName}`, e),
        );
    }

    prepare();
  }, [exampleName, componentName]);

  const { density, mode: exampleMode, theme } = useLivePreviewControls();
  const mode = (exampleMode === "system" ? siteMode : exampleMode) ?? siteMode;
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
              applyClassesTo="scope"
            >
              <div className={styles.example}>
                {/* Blank theme is needed here to prevent the site theme being inherited */}
                <ChosenSaltProvider
                  applyClassesTo="scope"
                  theme=""
                  density={density}
                  mode={mode}
                >
                  {ComponentExample.Example && <ComponentExample.Example />}
                </ChosenSaltProvider>
              </div>
            </ChosenSaltProvider>
            {/* Unset theme, font size override would cause switch misalignment */}
            <SaltProviderNext density="low" applyClassesTo="child" theme="">
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
