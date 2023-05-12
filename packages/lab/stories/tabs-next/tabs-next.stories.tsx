import { useState } from "react";
import { TabPanelNext, TabsNext, TabsNextProps } from "@salt-ds/lab";
import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { Story } from "@storybook/react";

export default {
  title: "Lab/Tabs Next/Tabs Next",
  component: TabsNext,
  args: {
    selectedTab: undefined,
    onSelectTab: undefined,
  },
};

type TabsStory = Story<
  TabsNextProps & {
    width?: number;
  }
>;

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const Default: TabsStory = ({ width = 600, ...props }) => {
  return (
    <div style={{ width, maxWidth: "100%" }}>
      <TabsNext {...props}>
        {tabs.map((label) => (
          <TabPanelNext label={label} key={label} value={label}>
            <Text>Content for {label} tab</Text>
          </TabPanelNext>
        ))}
      </TabsNext>
    </div>
  );
};

export const DefaultSelectedTabIndex: TabsStory = ({
  width = 600,
  ...props
}) => {
  return (
    <div style={{ width, maxWidth: "100%" }}>
      <TabsNext {...props} defaultSelectedTab="Loans">
        {tabs.map((label) => (
          <TabPanelNext label={label} key={label} value={label}>
            <Text>Content for {label} tab</Text>
          </TabPanelNext>
        ))}
      </TabsNext>
    </div>
  );
};

export const WithSecondaryContainer = () => {
  return (
    <div
      style={{
        width: 600,
        maxWidth: "100%",
        height: 300,
        background: "var(--salt-container-secondary-background)",
      }}
    >
      <TabsNext>
        {tabs.map((label) => (
          <TabPanelNext label={label} key={label} value={label}>
            <Text>Content for {label} tab</Text>
          </TabPanelNext>
        ))}
      </TabsNext>
    </div>
  );
};

export const Centered: TabsStory = ({ width = 600, ...props }) => {
  return (
    <div style={{ width, maxWidth: "100%" }}>
      <TabsNext align="center" {...props}>
        {tabs.map((label) => (
          <TabPanelNext label={label} key={label} value={label}>
            <Text>Content for {label} tab</Text>
          </TabPanelNext>
        ))}
      </TabsNext>
    </div>
  );
};

export const LotsOfTabs: TabsStory = ({ width = 600, ...props }) => {
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

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabsNext {...props}>
        {tabs.map((label) => (
          <TabPanelNext label={label} key={label} value={label}>
            <Text>Content for {label} tab</Text>
          </TabPanelNext>
        ))}
      </TabsNext>
    </div>
  );
};

export const Controlled: TabsStory = ({ width = 600, ...props }) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [selectedTab, setSelectedTab] = useState<string>("Home");

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <StackLayout gap={1}>
        <FlexLayout gap={1}>
          <Button onClick={() => setSelectedTab("Home")}>Home</Button>
          <Button onClick={() => setSelectedTab("Liquidity")}>End</Button>
        </FlexLayout>
        <TabsNext
          {...props}
          selectedTab={selectedTab}
          onSelectTab={(e, t) => setSelectedTab(t)}
        >
          {tabs.map((label) => (
            <TabPanelNext label={label} key={label} value={label}>
              <Text>Content for {label} tab</Text>
            </TabPanelNext>
          ))}
        </TabsNext>
      </StackLayout>
    </div>
  );
};
