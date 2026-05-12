import {
  FormField,
  FormFieldLabel,
  Panel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Tab,
  TabBar,
  TabList,
  type TabListProps,
  TabPanel,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

const tabs = ["Home", "Transactions", "Loans"];

export const ActiveColor = (): ReactElement => {
  const [variant, setVariant] =
    useState<TabListProps["activeColor"]>("primary");

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value as TabListProps["activeColor"]);
  };

  return (
    <StackLayout gap={6} style={{ width: "100%", minWidth: 0 }}>
      <Tabs defaultValue={tabs[0]}>
        <TabBar divider>
          <TabList activeColor={variant} aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
        </TabBar>
        {tabs.map((label) => (
          <TabPanel value={label} key={label} style={{ height: 200 }}>
            <Panel variant={variant}>{label}</Panel>
          </TabPanel>
        ))}
      </Tabs>

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
