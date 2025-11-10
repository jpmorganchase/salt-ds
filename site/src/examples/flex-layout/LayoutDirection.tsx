import {
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  type LayoutDirection as LayoutDirectionType,
  RadioButton,
  RadioButtonGroup,
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
  const [direction, setDirection] = useState<LayoutDirectionType>("column");

  const handleDirectionChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setDirection(value as LayoutDirectionType);
  };

  return (
    <div className={layoutDirectionStyles.container}>
      <FlexLayout direction={direction} align="center">
        {Array.from({ length: 6 }, (_, index) => (
          <FlexItem key={index} className={styles.flexItem}>
            {index + 1}
          </FlexItem>
        ))}
      </FlexLayout>
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
