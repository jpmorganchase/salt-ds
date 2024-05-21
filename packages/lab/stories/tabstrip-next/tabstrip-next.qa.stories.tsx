import { TabNext, TabstripNext, type TabstripNextProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer } from "docs/components";
import { useState } from "react";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabstrip Next/Tabstrip Next QA",
  component: TabstripNext,
};

type TabstripStory = StoryFn<
  TabstripNextProps & {
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

export const LotsOfTabsTabstrip: TabstripStory = ({
  width = 300,
  ...tabstripProps
}) => {
  const [value, setValue] = useState<string | undefined>("Home");
  return (
    <QAContainer itemPadding={10} cols={2}>
      <TabstripNext
        {...tabstripProps}
        value={value}
        onChange={(_, value) => {
          setValue(value);
        }}
      >
        {tabs.map((label) => (
          <TabNext key={label} value={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
      <TabstripNext
        {...tabstripProps}
        value={value}
        variant="inline"
        onChange={(_, value) => {
          setValue(value);
        }}
      >
        {tabs.map((label) => (
          <TabNext key={label} value={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </QAContainer>
  );
};

LotsOfTabsTabstrip.parameters = {
  chromatic: { disableSnapshot: false },
};
