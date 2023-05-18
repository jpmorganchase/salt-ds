import { useState } from "react";
import { Story } from "@storybook/react";
import { Button, FlexLayout } from "@salt-ds/core";
import { TabstripNextProps, TabstripNext, Tab } from "@salt-ds/lab";
import { AddIcon } from "@salt-ds/icons";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/TabsNext/TabstripNext",
  component: TabstripNext,
};

type TabstripStory = Story<TabstripNextProps>;

export const SimpleTabstrip: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultActiveTabIndex={0} {...tabstripProps}>
        {tabs.map((label) => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabstripNext>
    </div>
  );
};

export const CenteredTabstrip: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultActiveTabIndex={0} {...tabstripProps} align="center">
        {tabs.map((label) => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabstripNext>
    </div>
  );
};

export const ControlledTabstrip: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);

  return (
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabstripNext>
    </div>
  );
};

export const AddTabTabstrip: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
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
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <FlexLayout align="center">
        <TabstripNext
          {...tabstripProps}
          activeTabIndex={activeTabIndex}
          onActiveChange={setActiveTabIndex}
        >
          {tabs.map((label) => (
            <Tab key={label}>{label}</Tab>
          ))}
        </TabstripNext>
        <Button onClick={handleAddTab}>
          <AddIcon />
        </Button>
      </FlexLayout>
    </div>
  );
};

export const CloseTabTabstrip: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);
  return (
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <Tab
            key={label}
            closeable
            onClose={(tabIndex) => {
              setTabs((s) => s.filter((t, index) => index !== tabIndex));
            }}
          >
            {label}
          </Tab>
        ))}
      </TabstripNext>
    </div>
  );
};

export const ActiveIndexNull: TabstripStory = ({
  ...tabstripProps
}: TabstripNextProps) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);

  return (
    <div style={{ width: 600, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
      >
        {tabs.map((label) => (
          <Tab key={label}>{label}</Tab>
        ))}
      </TabstripNext>
    </div>
  );
};
