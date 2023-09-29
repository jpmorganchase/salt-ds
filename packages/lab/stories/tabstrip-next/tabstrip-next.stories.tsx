import { useState } from "react";
import { StoryFn } from "@storybook/react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { AddIcon } from "@salt-ds/icons";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabstrip Next",
  component: TabstripNext,
  args: {
    selected: undefined,
    onChange: undefined,
  },
};

type TabstripStory = StoryFn<
  TabstripNextProps & {
    width?: number;
  }
>;

export const Default: TabstripStory = ({ width = 600, ...tabstripProps }) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext defaultSelected="Home" {...tabstripProps}>
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
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
        defaultSelected="Transactions"
        style={{ justifyContent: "center" }}
        {...tabstripProps}
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

export const ControlledTabstrip: TabstripStory = ({
  width = 600,
  ...tabstripProps
}) => {
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  const [selected, setSelected] = useState<string>("Home");

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <StackLayout gap={1}>
        <FlexLayout gap={1}>
          <Button onClick={() => setSelected("Home")}>Home</Button>
          <Button onClick={() => setSelected("Liquidity")}>End</Button>
        </FlexLayout>
        <TabstripNext
          {...tabstripProps}
          selected={selected}
          onChange={(event, { value }) => {
            setSelected(value);
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
  const [selected, setSelected] = useState<string | undefined>("Home");
  const handleAddTab = () => {
    setTabs((t) => [...t, `Tab ${t.length + 1}`]);
  };

  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <FlexLayout align="center" gap={1}>
        <TabstripNext
          {...tabstripProps}
          selected={selected}
          onChange={(event, { value }) => {
            setSelected(value);
          }}
        >
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
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

  const [selected, setSelected] = useState<string | undefined>("Home");
  return (
    <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
      <TabstripNext
        {...tabstripProps}
        selected={selected}
        onChange={(event, { value }) => {
          setSelected(value);
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
