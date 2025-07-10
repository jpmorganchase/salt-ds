import {
  BorderItem,
  BorderLayout,
  type BorderPosition,
  BORDER_POSITION as borderPosition,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import borderItemPositionStyles from "./BorderItemPosition.module.css";
import styles from "./index.module.css";

export const BorderItemPosition = (): ReactElement => {
  const [position, setPosition] = useState<BorderPosition>("west");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setPosition(value as BorderPosition);
  };

  return (
    <div className={borderItemPositionStyles.container}>
      <BorderLayout>
        <BorderItem
          position="north"
          className={clsx(styles.borderItem, {
            [borderItemPositionStyles.active]: position === "north",
          })}
        >
          North
        </BorderItem>
        <BorderItem
          position="west"
          className={clsx(styles.borderItem, {
            [borderItemPositionStyles.active]: position === "west",
          })}
        >
          West
        </BorderItem>
        <BorderItem
          position="center"
          className={clsx(styles.borderItem, {
            [borderItemPositionStyles.active]: position === "center",
          })}
        >
          Center
        </BorderItem>
        <BorderItem
          position="east"
          className={clsx(styles.borderItem, {
            [borderItemPositionStyles.active]: position === "east",
          })}
        >
          East
        </BorderItem>
        <BorderItem
          position="south"
          className={clsx(styles.borderItem, {
            [borderItemPositionStyles.active]: position === "south",
          })}
        >
          South
        </BorderItem>
      </BorderLayout>
      <div className={borderItemPositionStyles.radioButtonGroup}>
        <FormField>
          <FormFieldLabel>Position</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Position Controls"
            name="position"
            onChange={handleChange}
            value={position}
          >
            {borderPosition.map((position) => (
              <RadioButton
                key={position}
                label={`${position.charAt(0).toUpperCase()}${position.slice(
                  1,
                )}`}
                value={position}
              />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
    </div>
  );
};
