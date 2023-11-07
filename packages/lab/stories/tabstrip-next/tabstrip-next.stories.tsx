import { useState, ComponentType } from "react";
import { StoryFn } from "@storybook/react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { TabstripNextProps, TabstripNext, TabNext, Badge } from "@salt-ds/lab";
import {
  BankCheckIcon,
  CreditCardIcon,
  HomeIcon,
  LineChartIcon,
  ReceiptIcon,
} from "@salt-ds/icons";
import "./tabstrip-next.stories.css";
export default {
  title: "Lab/Tabs Next/Tabstrip Next",
  component: TabstripNext,
  args: {
    value: undefined,
    onChange: undefined,
  },
};

type TabstripStory = StoryFn<
  TabstripNextProps & {
    width?: number;
    tabs: string[];
  }
>;

const tabToIcon: Record<string, ComponentType> = {
  Home: HomeIcon,
  Transactions: ReceiptIcon,
  Loans: CreditCardIcon,
  Checks: BankCheckIcon,
  Liquidity: LineChartIcon,
};

const TabstripTemplate: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
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

export const DefaultLeftAligned = TabstripTemplate.bind({});
DefaultLeftAligned.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const MainTabBleedingIntoPrimaryBackground: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div
      style={{
        width,
        minWidth: 0,
        maxWidth: "100%",
      }}
      className="container secondary-container"
    >
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => {
          return (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      <div className="inner-container primary-container"></div>
    </div>
  );
};

MainTabBleedingIntoPrimaryBackground.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const MainTabBleedingIntoSecondaryBackground: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div
      style={{
        width,
        minWidth: 0,
        maxWidth: "100%",
      }}
      className="container primary-container"
    >
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => {
          return (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      <div className="inner-container secondary-container"></div>
    </div>
  );
};

MainTabBleedingIntoSecondaryBackground.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
  activeColor: "secondary",
};

export const Inline = TabstripTemplate.bind({});
Inline.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
  variant: "inline",
};

export const InlineWithSecondaryBackground: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div
      style={{ width, display: "flex", height: 200 }}
      className="secondary-container"
    >
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

export const Centered = TabstripTemplate.bind({});
Centered.args = {
  align: "center",
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const RightAligned = TabstripTemplate.bind({});
RightAligned.args = {
  align: "right",
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const WithIcon: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultValue={tabs[0]} {...tabstripProps}>
        {tabs.map((label) => {
          const Icon = tabToIcon[label];
          return (
            <TabNext
              value={label}
              key={label}
              disabled={label === "Transactions"}
            >
              <Icon /> {label}
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

export const WithBadge: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
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

export const ControlledTabstrip: TabstripStory = ({
  width = 600,
  tabs,
  ...tabstripProps
}) => {
  const [value, setValue] = useState<string>(tabs[0]);

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <StackLayout gap={1}>
        <FlexLayout gap={1}>
          <Button onClick={() => setValue("Home")}>Home</Button>
          <Button onClick={() => setValue("Liquidity")}>End</Button>
        </FlexLayout>
        <TabstripNext
          {...tabstripProps}
          value={value}
          onChange={(_, { value }) => {
            setValue(value);
          }}
        >
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
      </StackLayout>
    </div>
  );
};
ControlledTabstrip.args = {
  tabs: ["Home", "Transactions", "Loans", "Checks", "Liquidity"],
};

export const LotsOfTabsTabstrip = TabstripTemplate.bind({});
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
