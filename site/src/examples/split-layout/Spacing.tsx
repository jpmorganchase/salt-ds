import {
  FlexItem,
  FlowLayout,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ReactElement, useState } from "react";
import styles from "./Spacing.module.css";

export const Spacing = (): ReactElement => {
  const [padding, setPadding] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  const startItem = (
    <FlowLayout>
      {Array.from({ length: 3 }, (_, index) => (
        <FlexItem
          key={index}
          className={clsx(styles.spacingExampleGap, styles.item)}
          padding={2}
        >
          {index + 1}
        </FlexItem>
      ))}
    </FlowLayout>
  );
  const endItem = (
    <FlowLayout>
      {Array.from({ length: 2 }, (_, index) => (
        <FlexItem
          key={index}
          className={clsx(styles.spacingExampleGap, styles.item)}
          padding={2}
        >
          {index + 4}
        </FlexItem>
      ))}
    </FlowLayout>
  );

  return (
    <StackLayout align="center" className={styles.container}>
      <div
        className={clsx(
          {
            [styles.spacingExampleMargin]: margin > 0,
          },
          styles.container,
        )}
      >
        <SplitLayout
          className={clsx({
            [styles.spacingExamplePadding]: padding > 0,
          })}
          padding={padding}
          margin={margin}
          startItem={startItem}
          endItem={endItem}
        />
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
