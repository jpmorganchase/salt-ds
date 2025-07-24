import {
  BorderItem,
  BorderLayout,
  GRID_ALIGNMENT_BASE as borderItemAlignment,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import borderItemAlignmentStyles from "./BorderItemAlignment.module.css";
import styles from "./index.module.css";

type BorderItemAlignmentType = (typeof borderItemAlignment)[number];

export const BorderItemAlignment = (): ReactElement => {
  const [verticalAlignment, setVerticalAlignment] =
    useState<BorderItemAlignmentType>("stretch");
  const [horizontalAlignment, setHorizontalAlignment] =
    useState<BorderItemAlignmentType>("stretch");

  const handleVerticalChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setVerticalAlignment(value as BorderItemAlignmentType);
  };

  const handleHorizontalChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setHorizontalAlignment(value as BorderItemAlignmentType);
  };

  return (
    <div className={borderItemAlignmentStyles.container}>
      <BorderLayout className={borderItemAlignmentStyles.borderLayout}>
        <BorderItem position="north" className={styles.borderItem}>
          North
        </BorderItem>
        <BorderItem position="west" className={styles.borderItem}>
          West
        </BorderItem>
        <BorderItem
          position="center"
          className={styles.borderItem}
          horizontalAlignment={horizontalAlignment}
          verticalAlignment={verticalAlignment}
        >
          Center
        </BorderItem>
      </BorderLayout>
      <div className={borderItemAlignmentStyles.radioButtonGroups}>
        <FormField>
          <FormFieldLabel>Vertical alignment</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Vertical alignment Controls"
            name="verticalAlignment"
            onChange={handleVerticalChange}
            value={verticalAlignment}
          >
            {borderItemAlignment.map((alignment) => (
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
            {borderItemAlignment.map((alignment) => (
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
