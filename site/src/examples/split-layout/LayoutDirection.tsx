import {
  FlexItem,
  FormField,
  FormFieldLabel,
  type LayoutDirection as LayoutDirectionType,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import layoutDirectionStyles from "./LayoutDirection.module.css";

const layoutDirectionOptions = [
  "column",
  "column-reverse",
  "row",
  "row-reverse",
];

const startItem = (
  <StackLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
const endItem = (
  <StackLayout>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </StackLayout>
);

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
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        direction={direction}
        align="center"
        className={layoutDirectionStyles.splitLayout}
      />

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
