import { SaltProviderNext, Switch, useId } from "@salt-ds/core";
import { SaltProvider } from "@salt-ds/core";
import clsx from "clsx";
import {
  type ChangeEvent,
  type ElementType,
  type FC,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import useIsMobileView from "../../utils/useIsMobileView";
import { Pre } from "../mdx/pre";
import { useLivePreviewControls } from "./useLivePreviewControls";

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

  const { density, mode, accent, corner, themeNext } = useLivePreviewControls();

  const handleShowCodeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const newShowCode = event.target.checked;
    setShowCode(newShowCode);
  };

  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  const panelId = useId();

  return (
    <>
      {children}
      <div className={styles.container}>
        <div
          className={clsx(styles.componentPreview, {
            [styles.smallViewport]: isMobileView,
          })}
        >
          <ChosenSaltProvider mode={mode} accent={accent} corner={corner}>
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
    </>
  );
};
