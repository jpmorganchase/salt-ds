import { FC, ChangeEvent, useState, ReactNode, ReactElement } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import clsx from "clsx";
import { Switch } from "@salt-ds/lab";
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
  const [checked, setChecked] = useState(false);

  const isMobileView = useIsMobileView();

  const ComponentExample: () => ReactElement =
    require(`../../examples/${componentName}`)[exampleName];

  const exampleJSX = ComponentExample && ComponentExample();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const { density, mode } = useLivePreviewControls();

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
                  checked={checked}
                  onChange={handleChange}
                  className={styles.switch}
                  label="Show code"
                />
              </SaltProvider>
            </div>
          </SaltProvider>
        </div>

        {checked && (
          <Pre className={styles.codePreview}>
            <div className="language-tsx">
              {reactElementToJSXString(exampleJSX, {
                showFunctions: true,
              })}
            </div>
          </Pre>
        )}
      </div>
    </>
  );
};
