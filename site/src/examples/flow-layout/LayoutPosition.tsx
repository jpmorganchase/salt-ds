import {
  type FlexContentAlignment,
  FlexItem,
  FlowLayout,
  FormField,
  FormFieldLabel,
  FLEX_ALIGNMENT_BASE as flexAlignment,
  FLEX_CONTENT_ALIGNMENT_BASE as flexContentAlignment,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import layoutPositionStyles from "./LayoutPosition.module.css";

type FlexAlignment = (typeof flexAlignment)[number];
type FlexAlign = FlexAlignment | "stretch" | "baseline";

const FlexAlignmentOptions = [...flexAlignment, "stretch", "baseline"];

export const LayoutPosition = (): ReactElement => {
  const [align, setAlign] = useState<FlexAlign>("center");
  const [justify, setJustify] = useState<FlexContentAlignment>("center");

  const handleAlignChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setAlign(value as FlexAlign);
  };

  const handleJustifyChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setJustify(value as FlexContentAlignment);
  };

  return (
    <div className={layoutPositionStyles.container}>
      <FlowLayout
        align={align}
        justify={justify}
        className={clsx(styles.flowLayout, layoutPositionStyles.flowLayout)}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <FlexItem key={index} className={styles.flexItem}>
            {index + 1}
          </FlexItem>
        ))}
      </FlowLayout>
      <div className={layoutPositionStyles.radioButtonGroups}>
        <FormField>
          <FormFieldLabel>Align</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Align Controls"
            name="align"
            onChange={handleAlignChange}
            value={align}
          >
            {FlexAlignmentOptions.map((alignment) => (
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
          <FormFieldLabel>Justify</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Justify Controls"
            name="justify"
            onChange={handleJustifyChange}
            value={justify}
          >
            {flexContentAlignment.map((alignment) => (
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
