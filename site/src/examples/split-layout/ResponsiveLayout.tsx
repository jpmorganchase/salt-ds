import {
  FlexItem,
  FormField,
  FormFieldLabel,
  type LayoutDirection,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import clsx from "clsx";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import responsiveLayoutStyles from "./ResponsiveLayout.module.css";

const viewportOptions = ["Large", "Small"] as const;
type Viewport = (typeof viewportOptions)[number];

const StartItem = ({ direction }: { direction: LayoutDirection }) => (
  <StackLayout direction={direction}>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </StackLayout>
);
const EndItem = ({ direction }: { direction: LayoutDirection }) => (
  <StackLayout direction={direction}>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </StackLayout>
);

export const ResponsiveLayout = (): ReactElement => {
  const [viewport, setViewport] = useState<Viewport>("Large");
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setViewport(value as Viewport);
  };
  const direction = viewport === "Large" ? "row" : "column";
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
      <SplitLayout
        startItem={<StartItem direction={direction} />}
        endItem={<EndItem direction={direction} />}
        direction={direction}
        align="center"
        className={clsx(styles.splitLayout, {
          [responsiveLayoutStyles.column]: direction === "column",
        })}
      />
    </div>
  );
};
