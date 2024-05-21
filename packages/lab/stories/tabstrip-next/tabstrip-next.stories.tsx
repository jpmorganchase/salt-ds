import { Badge, Panel } from "@salt-ds/core";
import {
  BankCheckIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import {
  TabNext,
  TabNextPanel,
  TabsNext,
  TabstripNext,
  type TabstripNextProps,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { type ComponentType, useRef, useState } from "react";

import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next",
  component: TabsNext,
  args: {
    value: undefined,
    onChange: undefined,
  },
};

type TabsStory = StoryFn<
  TabstripNextProps & {
    tabs?: string[];
  }
>;

const TabsTemplate: TabsStory = ({ tabs = [], ...tabstripProps }) => {
  return (
    <div className="container">
      <TabsNext>
        <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
        {tabs.map((label) => (
          <TabNextPanel value={label} key={label}>
            {label}
          </TabNextPanel>
        ))}
      </TabsNext>
    </div>
  );
};

export const DefaultLeftAligned = TabsTemplate.bind({});
DefaultLeftAligned.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const MainTabBleedingIntoPrimaryBackground: TabsStory = ({
  tabs = [],
  ...tabstripProps
}) => {
  return (
    <div className="container secondary-container">
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => {
          return (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      <Panel className="inner-container" />
    </div>
  );
};

MainTabBleedingIntoPrimaryBackground.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const MainTabBleedingIntoSecondaryBackground: TabsStory = ({
  tabs = [],
  ...tabstripProps
}) => {
  return (
    <div className="container primary-container">
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => {
          return (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      <Panel variant="secondary" className="inner-container" />
    </div>
  );
};

MainTabBleedingIntoSecondaryBackground.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
  activeColor: "secondary",
};

export const Inline = TabsTemplate.bind({});
Inline.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
  variant: "inline",
};

export const InlineWithSecondaryBackground: TabsStory = ({
  tabs = [],
  ...tabstripProps
}) => {
  return (
    <div className="secondary-container">
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

InlineWithSecondaryBackground.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
  variant: "inline",
};

export const Centered = TabsTemplate.bind({});
Centered.args = {
  align: "center",
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const RightAligned = TabsTemplate.bind({});
RightAligned.args = {
  align: "right",
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

const tabToIcon: Record<string, ComponentType> = {
  Home: HomeIcon,
  Transactions: ReceiptIcon,
  Loans: CreditCardIcon,
  Checks: BankCheckIcon,
  Liquidity: LineChartIcon,
};

export const WithIcon: TabsStory = ({ tabs = [], ...tabstripProps }) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
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
      </TabstripNext>
    </div>
  );
};

WithIcon.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const WithBadge: TabsStory = ({ tabs = [], ...tabstripProps }) => {
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
            {label === "Transactions" && <Badge value={2} />}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

WithBadge.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const LotsOfTabsTabstrip = TabsTemplate.bind({});
LotsOfTabsTabstrip.args = {
  tabs: [
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
  ],
};

export const Closable: TabsStory = ({ ...tabstripProps }) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        defaultValue={tabs[0]}
        onClose={(_event, closedTab) => {
          setTabs(tabs.filter((tab) => tab !== closedTab));
        }}
        {...tabstripProps}
      >
        {tabs.map((label) => (
          <TabNext value={label} key={label} closable>
            {label}
            {label === "Transactions" && <Badge value={2} />}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const AddTabs: TabsStory = ({ ...tabstripProps }) => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState("Home");
  const newCount = useRef(0);

  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        value={value}
        onChange={(_event, newValue) => setValue(newValue)}
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
      </TabstripNext>
    </div>
  );
};

export const TabPanel = () => {
  return (
    <div style={{ width: 500, height: 400 }}>
      <TabsNext>
        <TabstripNext defaultValue="Transactions">
          <TabNext value="Transactions">Transactions</TabNext>
          <TabNext value="Loans">Loans</TabNext>
          <TabNext value="Checks">Checks</TabNext>
        </TabstripNext>
        <TabNextPanel value="Transactions">Transactions</TabNextPanel>
        <TabNextPanel value="Loans">Loans</TabNextPanel>
        <TabNextPanel value="Checks">Checks</TabNextPanel>
      </TabsNext>
    </div>
  );
};
