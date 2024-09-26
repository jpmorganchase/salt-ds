import {
  Badge,
  FormField,
  FormFieldLabel,
  Panel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  BankCheckIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import {
  TabListNext,
  type TabListNextProps,
  TabNext,
  TabNextPanel,
  TabsNext,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import {
  type ChangeEvent,
  type ComponentType,
  type ReactElement,
  useRef,
  useState,
} from "react";

import "./tabs-next.stories.css";

export default {
  title: "Lab/Tabs Next",
  component: TabsNext,
  args: {
    value: undefined,
    onChange: undefined,
  },
};

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
const lotsOfTabs = [
  "Home",
  "Transactions",
  "Loans",
  "Checks",
  "Liquidity",
  "With",
  "Lots",
  "More",
  "Additional",
  "Tabs",
  "Added",
  "In order to",
  "Showcase overflow",
  "Menu",
  "On",
  "Larger",
  "Screens",
];

const TabsTemplate: StoryFn<typeof TabsNext> = ({ ...rest }) => {
  return (
    <div className="container">
      <TabsNext {...rest}>
        <TabListNext defaultValue={tabs[0]}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

export const Main: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabListNext variant="main">
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

Main.args = {
  defaultValue: tabs[0],
};

export const Inline: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabListNext variant="inline">
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

Inline.args = {
  defaultValue: tabs[0],
};

const tabToIcon: Record<string, ComponentType> = {
  Home: HomeIcon,
  Transactions: ReceiptIcon,
  Loans: CreditCardIcon,
  Checks: BankCheckIcon,
  Liquidity: LineChartIcon,
};

export const WithIcon: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabListNext>
          {tabs.map((label) => {
            const Icon = tabToIcon[label];
            return (
              <TabNext
                value={label}
                key={label}
                disabled={label === "Transactions"}
              >
                <Icon aria-hidden /> {label}
              </TabNext>
            );
          })}
        </TabListNext>
      </TabsNext>
    </div>
  );
};

WithIcon.args = {
  defaultValue: tabs[0],
};

export const WithBadge: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
              {label === "Transactions" && <Badge value={2} />}
            </TabNext>
          ))}
        </TabListNext>
      </TabsNext>
    </div>
  );
};

WithBadge.args = {
  defaultValue: tabs[0],
};

export const Overflow: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabListNext>
          {lotsOfTabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabsNext>
    </div>
  );
};

Overflow.args = {
  defaultValue: lotsOfTabs[0],
};

export const Closable: StoryFn<typeof TabsNext> = (args) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...args}>
        <TabListNext
          onClose={(_event, closedTab) => {
            setTabs(tabs.filter((tab) => tab !== closedTab));
          }}
        >
          {tabs.map((label) => (
            <TabNext value={label} key={label} closable={tabs.length > 1}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabsNext>
    </div>
  );
};

Closable.args = {
  defaultValue: tabs[0],
};

export const DisabledTabs: StoryFn<typeof TabsNext> = (args) => {
  return (
    <div className="container">
      <TabsNext {...args}>
        <TabListNext variant="main">
          {tabs.map((label) => (
            <TabNext disabled={label === "Loans"} value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

DisabledTabs.args = {
  defaultValue: tabs[0],
};

export const AddTabs: StoryFn<typeof TabsNext> = (args) => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState("Home");
  const newCount = useRef(0);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabsNext
        {...args}
        value={value}
        onChange={(_event, newValue) => setValue(newValue)}
      >
        <TabListNext
          onAdd={() => {
            const newTab = `New Tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
            newCount.current += 1;

            setTabs((old) => old.concat(newTab));
            setValue(newTab);
          }}
        >
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabListNext>
      </TabsNext>
    </div>
  );
};

export const Backgrounds = (): ReactElement => {
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
