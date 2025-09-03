import {
  FlexItem,
  FormField,
  FormFieldLabel,
  type LayoutDirection as LayoutDirectionType,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import layoutDirectionStyles from "./LayoutDirection.module.css";

const layoutDirectionOptions = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
];

export const LayoutDirection = (): ReactElement => {
  const [direction, setDirection] = useState<LayoutDirectionType>("row");

  const handleDirectionChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setDirection(value as LayoutDirectionType);
  };

  return (
    <div className={layoutDirectionStyles.container}>
      <StackLayout direction={direction} align="center">
        {Array.from({ length: 4 }, (_, index) => (
          <FlexItem key={index} className={styles.flexItem}>
            {index + 1}
          </FlexItem>
        ))}
      </StackLayout>
      <div className={layoutDirectionStyles.radioButtonGroups}>
        <FormField>
          <FormFieldLabel>Direction</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Direction Controls"
            name="direction"
            onChange={handleDirectionChange}
            value={direction}
          >
            {layoutDirectionOptions.map((alignment) => (
              <RadioButton
                key={alignment}
                label={`${alignment.charAt(0).toUpperCase()}${alignment.slice(
                  1,
                )}`}
                value={alignment}
              />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
    </div>
  );
};
