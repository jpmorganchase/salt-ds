import {
  FormField,
  FormFieldLabel,
  Panel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  TabNext,
  TabNextPanel,
  TabsNext,
  TabListNext,
  type TabListNextProps,
} from "@salt-ds/lab";
import { type ChangeEvent, type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans"];

export const Variants = (): ReactElement => {
  const [variant, setAlignment] =
    useState<TabListNextProps["activeColor"]>("primary");

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAlignment(event.target.value as TabListNextProps["activeColor"]);
  };

  return (
    <StackLayout gap={6}>
      <div style={{ alignItems: "center", width: "40vw" }}>
        <TabsNext defaultValue={tabs[0]}>
          <TabListNext activeColor={variant}>
            {tabs.map((label) => (
              <TabNext value={label} key={label}>
                {label}
              </TabNext>
            ))}
          </TabListNext>
          {tabs.map((label) => (
            <TabNextPanel value={label} key={label} style={{ height: 200 }}>
              <Panel variant={variant}>{label}</Panel>
            </TabNextPanel>
          ))}
        </TabsNext>
      </div>
      <FormField style={{ width: "auto" }}>
        <FormFieldLabel>Select tabstrip color</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          value={variant}
          onChange={handleVariantChange}
        >
          <RadioButton label="Primary" value="primary" />
          <RadioButton label="Secondary" value="secondary" />
          <RadioButton label="Tertiary" value="tertiary" />
        </RadioButtonGroup>
      </FormField>
    </StackLayout>
  );
};
