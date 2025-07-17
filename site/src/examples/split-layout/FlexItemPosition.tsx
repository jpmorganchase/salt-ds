import {
  FlexItem,
  FlowLayout,
  FormField,
  FormFieldLabel,
  type flexItemAlignment,
  FLEX_ITEM_ALIGNMENTS as flexItemAlignments,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import flexItemPositionStyles from "./FlexItemPosition.module.css";
import styles from "./index.module.css";

const StartItem = ({ align }: { align: flexItemAlignment }) => (
  <FlowLayout>
    <FlexItem
      align={align}
      className={clsx(styles.flexItem, flexItemPositionStyles.active)}
    >
      1
    </FlexItem>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem
        key={index}
        className={clsx(styles.flexItem, flexItemPositionStyles.flexItem)}
      >
        {index + 2}
      </FlexItem>
    ))}
  </FlowLayout>
);
const endItem = (
  <FlowLayout>
    {Array.from({ length: 2 }, (_, index) => (
      <FlexItem
        key={index}
        className={clsx(styles.flexItem, flexItemPositionStyles.flexItem)}
      >
        {index + 4}
      </FlexItem>
    ))}
  </FlowLayout>
);

export const FlexItemPosition = (): ReactElement => {
  const [align, setAlign] = useState<flexItemAlignment>("start");

  const handleAlignChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setAlign(value as flexItemAlignment);
  };

  return (
    <div className={flexItemPositionStyles.container}>
      <SplitLayout startItem={<StartItem align={align} />} endItem={endItem} />

      <FormField>
        <FormFieldLabel>Align</FormFieldLabel>
        <RadioButtonGroup
          direction={"horizontal"}
          aria-label="Align Controls"
          name="align"
          onChange={handleAlignChange}
          value={align}
        >
          {flexItemAlignments.map((alignment) => (
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
