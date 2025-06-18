import {
  FlexItem,
  FlowLayout,
  FormField,
  FormFieldLabel,
  FLEX_ALIGNMENT_BASE as flexAlignment,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
} from "@salt-ds/core";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import styles from "./index.module.css";
import layoutAlignmentStyles from "./LayoutAlignment.module.css";

type FlexAlignment = (typeof flexAlignment)[number];
type FlexAlign = FlexAlignment | "stretch" | "baseline";

const FlexAlignmentOptions = [...flexAlignment, "stretch", "baseline"];
const startItem = (
  <FlowLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 1}
      </FlexItem>
    ))}
  </FlowLayout>
);
const endItem = (
  <FlowLayout>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem key={index} className={styles.flexItem}>
        {index + 4}
      </FlexItem>
    ))}
  </FlowLayout>
);

export const LayoutAlignment = (): ReactElement => {
  const [align, setAlign] = useState<FlexAlign>("center");
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setAlign(value as FlexAlign);
  };
  return (
    <div className={layoutAlignmentStyles.container}>
      <SplitLayout
        startItem={startItem}
        endItem={endItem}
        align={align}
        className={layoutAlignmentStyles.splitLayout}
      />
      <FormField>
        <FormFieldLabel>Align</FormFieldLabel>
        <RadioButtonGroup
          direction={"horizontal"}
          aria-label="Align Controls"
          name="align"
          onChange={handleChange}
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
    </div>
  );
};
