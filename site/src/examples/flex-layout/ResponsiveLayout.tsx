import {
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  type LayoutDirection,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import responsiveLayoutStyles from "./ResponsiveLayout.module.css";

const viewportOptions = ["Large", "Medium", "Small"] as const;
type Viewport = (typeof viewportOptions)[number];

type LayoutProps = {
  width: string | number;
  wrap: boolean;
  direction: LayoutDirection;
};

const getLayoutProps = (viewport: Viewport): LayoutProps => {
  if (viewport === "Medium") {
    return { width: 236, wrap: true, direction: "row" };
  }

  if (viewport === "Small") {
    return { width: 150, wrap: false, direction: "column" };
  }

  return { width: "100%", wrap: false, direction: "row" };
};

export const ResponsiveLayout = (): ReactElement => {
  const [viewport, setViewport] = useState<Viewport>("Large");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setViewport(value as Viewport);
  };

  const { width, wrap, direction } = getLayoutProps(viewport);

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
      <FlexLayout wrap={wrap} direction={direction} style={{ width }}>
        {Array.from({ length: 6 }, (_, index) => (
          <FlexItem key={index} className={styles.flexItem}>
            {index + 1}
          </FlexItem>
        ))}
      </FlexLayout>
    </div>
  );
};
