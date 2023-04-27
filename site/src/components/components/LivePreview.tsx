import { FC, ChangeEvent, useState, ReactNode } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import { Switch } from "@salt-ds/lab";
import { Pre } from "../mdx/pre";
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

  const ComponentExample = require(`../../examples/${componentName}`)[
    exampleName
  ];

  const exampleJSX = ComponentExample && ComponentExample({});

  const handleChange = (
    _: ChangeEvent<HTMLInputElement>,
    isChecked: boolean
  ) => {
    setChecked(isChecked);
  };

  return (
    <>
      {children}
      <div className={styles.container}>
        <div className={styles.componentPreview}>
          <div className={styles.example}>
            {ComponentExample && <ComponentExample />}
          </div>
          <Switch
            checked={checked}
            onChange={handleChange}
            className={styles.switch}
            label="Show code"
          />
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
