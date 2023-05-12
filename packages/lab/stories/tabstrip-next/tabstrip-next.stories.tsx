import { useState } from "react";
import { Story } from "@storybook/react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { AddIcon } from "@salt-ds/icons";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabstrip Next",
  component: TabstripNext,
  args: {
    selectedTab: undefined,
    onSelectTab: undefined,
  },
};

type TabstripStory = Story<
  TabstripNextProps & {
    width?: number;
  }
>;

export const Default: TabstripStory = ({ width = 600, ...tabstripProps }) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const SimpleTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultSelectedTab="Home" {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const CenteredTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        defaultSelectedTab="Transactions"
        {...tabstripProps}
        align="center"
      >
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const ControlledTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [selectedTabId, setSelectedTabId] = useState<string>("Home");

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <StackLayout gap={1}>
        <FlexLayout gap={1}>
          <Button onClick={() => setSelectedTabId("Home")}>Home</Button>
          <Button onClick={() => setSelectedTabId("Liquidity")}>End</Button>
        </FlexLayout>
        <TabstripNext
          {...tabstripProps}
          selectedTab={selectedTabId}
          onSelectTab={(e, id) => {
            setSelectedTabId(id);
          }}
        >
          {tabs.map((label) => (
            <TabNext label={label} value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
      </StackLayout>
    </div>
  );
};

export const AddTabTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  const [selectedTabId, setSelectedTabId] = useState<string | undefined>(
    "Home"
  );
  const handleAddTab = () => {
    setTabs((t) => [...t, `Tab ${t.length + 1}`]);
  };

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <FlexLayout align="center" gap={1}>
        <TabstripNext
          {...tabstripProps}
          selectedTab={selectedTabId}
          onSelectTab={(e, id) => {
            setSelectedTabId(id);
          }}
        >
          {tabs.map((label) => (
            <TabNext label={label} value={label} key={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
        <Button onClick={handleAddTab}>
          <AddIcon />
        </Button>
      </FlexLayout>
    </div>
  );
};

export const LotsOfTabsTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const [tabs] = useState([
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
  ]);
  const [selectedTabId, setSelectedTabId] = useState<string | undefined>(
    "Home"
  );
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        selectedTab={selectedTabId}
        onSelectTab={(e, id) => {
          setSelectedTabId(id);
        }}
      >
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const ActiveIdNull: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [selectedTabId, setSelectedTabId] = useState<string | undefined | null>(
    null
  );

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        selectedTab={selectedTabId}
        onSelectTab={(e, id) => {
          setSelectedTabId(id);
        }}
      >
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const DefaultSelectedTabIdNull: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext {...tabstripProps} defaultSelectedTab={null}>
        {tabs.map((label) => (
          <TabNext label={label} value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};
