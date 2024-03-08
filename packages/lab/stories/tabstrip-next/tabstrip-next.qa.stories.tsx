import { useState } from "react";
import { StoryFn } from "@storybook/react";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { QAContainer } from "docs/components";
import "./tabstrip-next.stories.css";
import { FlowLayout } from "@salt-ds/core";

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
    <QAContainer itemPadding={10} itemWidthAuto>
      <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
        <TabstripNext
          {...tabstripProps}
          value={value}
          onChange={(_, { value }) => {
            setValue(value);
          }}
        >
          {tabs.map((label) => (
            <TabNext key={label} value={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
      </div>
      <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
        <TabstripNext
          {...tabstripProps}
          value={value}
          variant="inline"
          onChange={(_, { value }) => {
            setValue(value);
          }}
        >
          {tabs.map((label) => (
            <TabNext key={label} value={label}>
              {label}
            </TabNext>
          ))}
        </TabstripNext>
      </div>
    </QAContainer>
  );
};

LotsOfTabsTabstrip.parameters = {
  chromatic: { disableSnapshot: false },
};
