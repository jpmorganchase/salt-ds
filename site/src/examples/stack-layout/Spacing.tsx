import {
  FlexItem,
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
  const [gap, setGap] = useState<number>(3);
  const [padding, setPadding] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  return (
    <StackLayout align="center">
      <div
        className={clsx({
          [styles.spacingExampleMargin]: margin > 0,
        })}
      >
        <StackLayout
          className={clsx({
            [styles.spacingExamplePadding]: padding > 0,
          })}
          gap={gap}
          padding={padding}
          margin={margin}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <FlexItem
              className={clsx(
                {
                  [styles.spacingExampleGap]: gap > 0,
                },
                styles.item,
              )}
              key={`item-${index + 1}`}
              padding={2}
            >
              <p>{index + 1}</p>
            </FlexItem>
          ))}
        </StackLayout>
      </div>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Gap</FormFieldLabel>
          <RadioButtonGroup
            onChange={(e) => setGap(Number.parseInt(e.target.value, 10))}
            direction="horizontal"
            value={`${gap}`}
          >
            <RadioButton label="0" value="0" />
            <RadioButton label="1" value="1" />
            <RadioButton label="2" value="2" />
            <RadioButton label="3" value="3" />
          </RadioButtonGroup>
        </FormField>
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
