import {
  TabBar,
  TabListNext,
  type TabListNextProps,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer } from "docs/components";
import { useState } from "react";
import "./tabs-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabs Next QA",
  component: TabListNext,
};

type TabstripStory = StoryFn<
  TabListNextProps & {
    width?: number;
  }
>;

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

export const LotsOfTabsTabstrip: TabstripStory = () => {
  const [value, setValue] = useState<string | undefined>("Home");
  return (
    <QAContainer itemPadding={10} cols={2}>
      <TabsNext
        value={value}
        onChange={(_, value) => {
          setValue(value);
        }}
      >
        <TabBar padding separator>
          <TabListNext>
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
          <TabListNext appearance="transparent">
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
  chromatic: { disableSnapshot: false },
};
