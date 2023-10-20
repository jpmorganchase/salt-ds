import { FC, ChangeEvent, useState, ReactNode, ReactElement } from "react";
import clsx from "clsx";
import { Switch } from "@salt-ds/core";
import { SaltProvider } from "@salt-ds/core";
import { Pre } from "../mdx/pre";
import { useLivePreviewControls } from "./useLivePreviewControls";
import useIsMobileView from "../../utils/useIsMobileView";

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

  const ComponentExample: () => ReactElement =
    require(`../../examples/${componentName}`)[exampleName];

  const codePreview =
    require(`!!raw-loader!../../examples/${componentName}/${exampleName}.tsx`).default;

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
                  {ComponentExample && <ComponentExample />}
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
          <Pre className={styles.codePreview}>
            <div className="language-tsx">{codePreview}</div>
          </Pre>
        )}
      </div>
    </>
  );
};
