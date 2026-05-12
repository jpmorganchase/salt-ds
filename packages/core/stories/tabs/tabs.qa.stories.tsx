import { Tab, TabBar, TabList, Tabs, TabTrigger } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { useState } from "react";
import "./tabs.stories.css";

export default {
  title: "Core/Tabs/Tabs QA",
  component: TabList,
};

const tabs = [
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

export const LotsOfTabsTabstrip: StoryFn = () => {
  const [value, setValue] = useState<string | undefined>("Home");
  return (
    <QAContainer itemPadding={10} cols={2}>
      <div className="container">
        <Tabs
          value={value}
          onChange={(_, value) => {
            setValue(value);
          }}
        >
          <TabBar inset divider>
            <TabList>
              {tabs.map((label) => (
                <Tab key={label} value={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
      <div className="container">
        <Tabs
          value={value}
          onChange={(_, value) => {
            setValue(value);
          }}
        >
          <TabBar>
            <TabList appearance="transparent">
              {tabs.map((label) => (
                <Tab key={label} value={label}>
                  <TabTrigger>{label}</TabTrigger>
                </Tab>
              ))}
            </TabList>
          </TabBar>
        </Tabs>
      </div>
    </QAContainer>
  );
};

LotsOfTabsTabstrip.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
