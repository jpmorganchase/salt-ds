import {
  BorderItem,
  BorderLayout,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ReactElement, useState } from "react";
import styles from "./Spacing.module.css";

export const Spacing = (): ReactElement => {
  const [padding, setPadding] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  return (
    <StackLayout align="center">
      <div
        className={clsx({
          [styles.spacingExampleMargin]: margin > 0,
        })}
      >
        <BorderLayout
          className={clsx({
            [styles.spacingExamplePadding]: padding > 0,
          })}
          padding={padding}
          margin={margin}
        >
          <BorderItem position="north" padding={2} className={styles.item}>
            North
          </BorderItem>
          <BorderItem position="west" padding={2} className={styles.item}>
            West
          </BorderItem>
          <BorderItem position="center" padding={2} className={styles.item}>
            Center
          </BorderItem>
          <BorderItem position="east" padding={2} className={styles.item}>
            East
          </BorderItem>
          <BorderItem position="south" padding={2} className={styles.item}>
            South
          </BorderItem>
        </BorderLayout>
      </div>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Padding</FormFieldLabel>
          <RadioButtonGroup
            onChange={(e) => setPadding(Number.parseInt(e.target.value, 10))}
            direction="horizontal"
            value={`${padding}`}
          >
            <RadioButton label="0" value="0" />
            <RadioButton label="1" value="1" />
            <RadioButton label="2" value="2" />
            <RadioButton label="3" value="3" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Margin</FormFieldLabel>
          <RadioButtonGroup
            onChange={(e) => setMargin(Number.parseInt(e.target.value, 10))}
            direction="horizontal"
            value={`${margin}`}
          >
            <RadioButton label="0" value="0" />
            <RadioButton label="1" value="1" />
            <RadioButton label="2" value="2" />
            <RadioButton label="3" value="3" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    </StackLayout>
  );
};
