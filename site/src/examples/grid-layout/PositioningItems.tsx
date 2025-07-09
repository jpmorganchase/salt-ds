import {
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  GRID_ALIGNMENT_BASE as gridItemAlignment,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import clsx from "clsx";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import positioningItemsStyles from "./PositioningItems.module.css";

type GridItemAlignmentType = (typeof gridItemAlignment)[number];

export const PositioningItems = (): ReactElement => {
  const [verticalAlignment, setVerticalAlignment] =
    useState<GridItemAlignmentType>("stretch");
  const [horizontalAlignment, setHorizontalAlignment] =
    useState<GridItemAlignmentType>("stretch");

  const handleVerticalChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setVerticalAlignment(value as GridItemAlignmentType);
  };

  const handleHorizontalChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setHorizontalAlignment(value as GridItemAlignmentType);
  };

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
            value={verticalAlignment}
          >
            {gridItemAlignment.map((alignment) => (
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

        <FormField>
          <FormFieldLabel>Horizontal alignment</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Horizontal alignment Controls"
            name="horizontalAlignment"
            onChange={handleHorizontalChange}
            value={horizontalAlignment}
          >
            {gridItemAlignment.map((alignment) => (
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
