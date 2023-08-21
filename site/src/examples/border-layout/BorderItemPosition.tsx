import { ReactElement, useState, ChangeEventHandler } from "react";
import clsx from "clsx";
import {
  BorderLayout,
  BorderItem,
  BORDER_POSITION as borderPosition,
  RadioButtonGroup,
  RadioButton,
  FormField,
  FormFieldLabel,
} from "@salt-ds/core";
import styles from "./index.module.css";
import borderItemPositionStyles from "./BorderItemPosition.module.css";

const positionOptions = borderPosition.map((position, index) => ({
  label: position,
  value: `option${index + 1}`,
}));

export const BorderItemPosition = (): ReactElement => {
  const [option, setOption] = useState("option2");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setOption(value);
  };

  const position =
    positionOptions.find(({ value }) => value === option)?.label || "west";

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
            value={option}
          >
            {positionOptions.map(({ label, value }) => (
              <RadioButton key={value} label={label} value={value} />
            ))}
          </RadioButtonGroup>
        </FormField>
      </div>
    </div>
  );
};
