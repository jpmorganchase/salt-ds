import { FC, ChangeEvent, useState } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import { Switch } from "@salt-ds/lab";
import { components } from "@jpmorganchase/mosaic-site-components";
import { h3 as H3 } from "../mdx";
import styles from "./LivePreview.module.css";

const Pre = components.pre;

type LivePreviewProps = { componentName: string };

export type ComponentExampleType = {
  example: FC;
  copy: {
    title: string;
    description: string;
  };
};

export const LivePreview: FC<LivePreviewProps> = ({ componentName }) => {
  const componentExamples: ComponentExampleType[] = Object.values(
    require(`../../examples/${componentName}`)
  );

  return (
    <>
      {componentExamples.map((component, index) => {
        const [checked, setChecked] = useState(false);

        const { copy, example: Example } = component;

        const exampleJSX = Example({});

        const handleChange = (
          _: ChangeEvent<HTMLInputElement>,
          isChecked: boolean
        ) => {
          setChecked(isChecked);
        };
        return (
          <div key={index}>
            <H3>{copy.title}</H3>
            <p>{copy.description}</p>
            <div className={styles.container}>
              <div className={styles.componentPreview}>
                <div className={styles.example}>
                  <Example />
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
          </div>
        );
      })}
    </>
  );
};
