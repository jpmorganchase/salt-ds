import { ReactElement, useState, ChangeEventHandler } from "react";
import {
  BorderLayout,
  BorderItem,
  GRID_ALIGNMENT_BASE as borderItemAlignment,
  RadioButtonGroup,
  RadioButton,
  FormField,
  FormFieldLabel,
} from "@salt-ds/core";
import styles from "./index.module.css";
import borderItemAlignmentStyles from "./BorderItemAlignment.module.css";

const alignmentOptions = borderItemAlignment.map((alignment, index) => ({
  label: alignment,
  value: `option${index + 1}`,
}));

export const BorderItemAlignment = (): ReactElement => {
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
