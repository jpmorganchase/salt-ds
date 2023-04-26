import { FC, ChangeEvent, useState, ReactNode, ReactElement } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import { Switch } from "@salt-ds/lab";
import { components } from "@jpmorganchase/mosaic-site-components";
import styles from "./LivePreview.module.css";

const Pre = components.pre;

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
            <>
              {reactElementToJSXString(exampleJSX, {
                showFunctions: true,
              })}
            </>
          </Pre>
        )}
      </div>
    </>
  );
};
