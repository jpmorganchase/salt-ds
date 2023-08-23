import { ReactElement, useState, ChangeEventHandler } from "react";
import {
  GridLayout,
  GridItem,
  GRID_ALIGNMENT_BASE as gridItemAlignment,
  FormField,
  FormFieldLabel,
  RadioButtonGroup,
  RadioButton,
} from "@salt-ds/core";
import clsx from "clsx";
import styles from "./index.module.css";
import positioningItemsStyles from "./PositioningItems.module.css";

const alignmentOptions = gridItemAlignment.map((alignment, index) => ({
  label: alignment,
  value: `option${index + 1}`,
}));

export const PositioningItems = (): ReactElement => {
  const [verticalOption, setVerticalOption] = useState("option4");
  const [horizontalOption, setHorizontalOption] = useState("option4");

  const handleVerticalChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const { value } = event.target;
    setVerticalOption(value);
  };

  const handleHorizontalChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const { value } = event.target;
    setHorizontalOption(value);
  };

  const verticalAlignment =
    alignmentOptions.find(({ value }) => value === verticalOption)?.label ||
    "stretch";

  const horizontalAlignment =
    alignmentOptions.find(({ value }) => value === horizontalOption)?.label ||
    "stretch";

  return (
    <div className={positioningItemsStyles.container}>
      <GridLayout columns={5} rows={2}>
        <GridItem
          className={clsx(styles.gridItem, styles.active)}
          horizontalAlignment={horizontalAlignment}
          verticalAlignment={verticalAlignment}
          colSpan={2}
          rowSpan={2}
        >
          <p>1</p>
        </GridItem>

        {Array.from({ length: 3 }, (_, index) => (
          <GridItem key={index} className={styles.gridItem}>
            <p>{index + 2}</p>
          </GridItem>
        ))}

        <GridItem className={styles.gridItem} colSpan={3}>
          <p>5</p>
        </GridItem>
      </GridLayout>
      <div className={positioningItemsStyles.radioButtonGroups}>
        <FormField>
          <FormFieldLabel>Vertical alignment</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Vertical alignment Controls"
            name="verticalAlignment"
            onChange={handleVerticalChange}
            value={verticalOption}
          >
            {alignmentOptions.map(({ label, value }) => (
              <RadioButton key={value} label={label} value={value} />
            ))}
          </RadioButtonGroup>
        </FormField>

        <FormField>
          <FormFieldLabel>Horizontal alignment</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Horizontal alignment Controls"
            name="horizontalAlignment"
            onChange={handleHorizontalChange}
            value={horizontalOption}
          >
            {alignmentOptions.map(({ label, value }) => (
              <RadioButton key={value} label={label} value={value} />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
    </div>
  );
};
