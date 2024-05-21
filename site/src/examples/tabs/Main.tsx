import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import { TabNext, TabstripNext, type TabstripNextProps } from "@salt-ds/lab";
import { type ChangeEvent, type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Main = (): ReactElement => {
  const [alignment, setAlignment] =
    useState<TabstripNextProps["align"]>("center");

  const handleAlignmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAlignment(event.target.value as TabstripNextProps["align"]);
  };

  return (
    <StackLayout gap={6} style={{ alignItems: "center", width: "30vw" }}>
      <TabstripNext defaultValue={tabs[0]} align={alignment}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
      <FormField style={{ width: "auto" }}>
        <FormFieldLabel>Select tabstrip alignment</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          value={alignment}
          onChange={handleAlignmentChange}
        >
          <RadioButton label="Left" value="left" />
          <RadioButton label="Center" value="center" />
          <RadioButton label="Right" value="right" />
        </RadioButtonGroup>
      </FormField>
    </StackLayout>
  );
};
