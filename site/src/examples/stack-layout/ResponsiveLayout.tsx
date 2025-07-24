import {
  FlexItem,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import responsiveLayoutStyles from "./ResponsiveLayout.module.css";

const viewportOptions = ["Large", "Small"] as const;
type Viewport = (typeof viewportOptions)[number];

export const ResponsiveLayout = (): ReactElement => {
  const [viewport, setViewport] = useState<Viewport>("Large");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setViewport(value as Viewport);
  };

  return (
    <div className={responsiveLayoutStyles.container}>
      <div className={responsiveLayoutStyles.radioButtonGroup}>
        <FormField>
          <FormFieldLabel>Viewport size</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Viewport Controls"
            name="viewport"
            onChange={handleChange}
            value={viewport}
          >
            {viewportOptions.map((viewport) => (
              <RadioButton key={viewport} label={viewport} value={viewport} />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
      <StackLayout
        separators
        direction={viewport === "Large" ? "row" : "column"}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <FlexItem key={index} className={styles.flexItem}>
            {index + 1}
          </FlexItem>
        ))}
      </StackLayout>
    </div>
  );
};
