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
      <TabstripNext defaultActiveTab={"home"} {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext id={label.toLowerCase()} key={label}>
            {label}
          </TabNext>
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
        defaultActiveTab={"home"}
        {...tabstripProps}
      >
        {tabs.map((label) => (
          <TabNext key={label} id={label.toLowerCase()}>
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
      <TabstripNext defaultActiveTab={"home"} {...tabstripProps} align="center">
        {tabs.map((label) => (
          <TabNext key={label} id={label.toLowerCase()}>
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
  const [activeTab, setActiveTab] = useState<string | undefined>("home");

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTab={activeTab}
        onActiveChange={setActiveTab}
      >
        {tabs.map((label) => (
          <TabNext key={label} id={label.toLowerCase()}>
            {label}
          </TabNext>
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
  const [activeTab, setActiveTab] = useState<string | undefined>("home");
  const handleAddTab = () => {
    setTabs((t) => [...t, `Tab ${t.length + 1}`]);
  };

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <FlexLayout align="center">
        <TabstripNext
          {...tabstripProps}
          activeTab={activeTab}
          onActiveChange={setActiveTab}
        >
          {tabs.map((label) => (
            <TabNext key={label} id={label.toLowerCase()}>
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
    { label: "Home", id: "home" },
    { label: "Transactions", id: "transactions" },
    { label: "Loans", id: "loans" },
    { label: "Checks", id: "checks" },
    { label: "Liquidity", id: "liquidity" },
    { label: "With", id: "with" },
    { label: "Lots", id: "lots" },
    { label: "More", id: "more" },
    { label: "Additional", id: "additional" },
    { label: "Tabs", id: "tabs" },
    { label: "Added", id: "added" },
    { label: "In order to", id: "in-order-to" },
    { label: "Showcase overflow", id: "showcase-overflow" },
    { label: "Menu", id: "menu" },
    { label: "On", id: "on" },
    { label: "Larger", id: "larger" },
    { label: "Screens", id: "screens" },
  ]);
  const [activeTab, setActiveTab] = useState<string | undefined>("home");
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTab={activeTab}
        onActiveChange={setActiveTab}
      >
        {tabs.map(({ label, id }) => (
          <TabNext key={label} id={id}>
            {label}
          </TabNext>
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
  const [activeTab, setActiveTab] = useState<string | undefined>("home");
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTab={activeTab}
        onActiveChange={setActiveTab}
      >
        {tabs.map((label) => (
          <TabNext
            key={label}
            closeable
            onClose={(tabIndex) => {
              setTabs((s) => s.filter((t, index) => index !== tabIndex));
            }}
            id={label.toLowerCase()}
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
  const [activeTab, setActiveTab] = useState<string | undefined | null>(null);

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        activeTab={activeTab}
        onActiveChange={setActiveTab}
      >
        {tabs.map((label) => (
          <TabNext key={label}>{label}</TabNext>
        ))}
      </TabstripNext>
    </div>
  );
};
