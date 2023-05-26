import { useState } from "react";
import { Story } from "@storybook/react";
import { Button, FlexLayout } from "@salt-ds/core";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { AddIcon } from "@salt-ds/icons";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/TabsNext/TabstripNext",
  component: TabstripNext,
};

type TabstripStory = Story<
  TabstripNextProps & {
    width?: number;
  }
>;

export const SimpleTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultActiveTabIndex={0} {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const TruncatedTabs: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = [
    "Home",
    "Transactions with long text",
    "Loans",
    "Checks",
    "Liquidity",
  ];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        tabMaxWidth={100}
        defaultActiveTabIndex={0}
        {...tabstripProps}
      >
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
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
      <TabstripNext defaultActiveTabIndex={0} {...tabstripProps} align="center">
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
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
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
        ))}
      </TabstripNext>
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
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);
  const handleAddTab = () => {
    setTabs((t) => [...t, `Tab ${t.length + 1}`]);
  };

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <FlexLayout align="center">
        <TabstripNext
          {...tabstripProps}
          activeTabIndex={activeTabIndex}
          onActiveChange={setActiveTabIndex}
        >
          {tabs.map((label) => (
            <TabNext key={label}>{label}</TabNext>
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
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const CloseTabTabstrip: TabstripStory = ({
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
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <TabNext
            key={label}
            closeable
            onClose={(tabIndex) => {
              setTabs((s) => s.filter((t, index) => index !== tabIndex));
            }}
          >
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};

export const ActiveIndexNull: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [activeTabIndex, setActiveTabIndex] = useState<
    number | undefined | null
  >(null);

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};
