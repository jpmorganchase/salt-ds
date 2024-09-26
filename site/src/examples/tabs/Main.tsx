import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  TabListNext,
  type TabListNextProps,
  TabNext,
  TabsNext,
} from "@salt-ds/lab";
import { type ChangeEvent, type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Main = (): ReactElement => {
  const [alignment, setAlignment] =
    useState<TabListNextProps["align"]>("center");

  const handleAlignmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAlignment(event.target.value as TabListNextProps["align"]);
  };

  return (
    <StackLayout gap={6} style={{ alignItems: "center", width: "30vw" }}>
      <TabsNext defaultValue={tabs[0]}>
        <TabListNext align={alignment}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabsNext>
      <FormField style={{ width: "auto" }}>
        <FormFieldLabel>Select alignment</FormFieldLabel>
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
