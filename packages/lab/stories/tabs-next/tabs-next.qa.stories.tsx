import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { useState } from "react";
import "./tabs-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabs Next QA",
  component: TabListNext,
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
      <TabsNext
        value={value}
        onChange={(_, value) => {
          setValue(value);
        }}
      >
        <TabBar inset divider>
          <TabListNext style={{ maxWidth: 350, margin: "auto" }}>
            {tabs.map((label) => (
              <TabNext key={label} value={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
      <TabsNext
        value={value}
        onChange={(_, value) => {
          setValue(value);
        }}
      >
        <TabBar>
          <TabListNext
            appearance="transparent"
            style={{ maxWidth: 350, margin: "auto" }}
          >
            {tabs.map((label) => (
              <TabNext key={label} value={label}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
      </TabsNext>
    </QAContainer>
  );
};

LotsOfTabsTabstrip.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
