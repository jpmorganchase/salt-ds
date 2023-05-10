import { FC, ChangeEvent, useState, ReactNode, ReactElement } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import clsx from "clsx";
import { Switch } from "@salt-ds/lab";
import { SaltProvider } from "@salt-ds/core";
import { Pre } from "../mdx/pre";
import { useLivePreviewControls } from "./useLivePreviewControls";
import styles from "./LivePreview.module.css";

type LivePreviewProps = {
  componentName: string;
  exampleName: string;
  children?: ReactNode;
};

export const LivePreview: FC<LivePreviewProps> = ({
  componentName,
  exampleName,
  children,
}) => {
  const [checked, setChecked] = useState(false);

  const ComponentExample: () => ReactElement =
    require(`../../examples/${componentName}`)[exampleName];

  const exampleJSX = ComponentExample && ComponentExample();

  const handleChange = (
    _: ChangeEvent<HTMLInputElement>,
    isChecked: boolean
  ) => {
    setChecked(isChecked);
  };

  const { density, mode } = useLivePreviewControls();

  return (
    <>
      {children}
      <div className={styles.container}>
        <SaltProvider mode={mode}>
          <div className={styles.componentPreview}>
            <div className={styles.example}>
              <SaltProvider density={density}>
                {ComponentExample && <ComponentExample />}
              </SaltProvider>
            </div>
            <Switch
              checked={checked}
              onChange={handleChange}
              className={styles.switch}
              label="Show code"
            />
          </div>
        </SaltProvider>
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
