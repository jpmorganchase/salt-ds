import { useState } from "react";
import { Story } from "@storybook/react";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { QAContainer } from "docs/components";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabstrip Next/QA",
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

export const LotsOfTabsTabstrip: TabstripStory = ({
  width = 300,
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
  const [selectedTab, setSelectedTab] = useState<string | undefined>("Home");
  return (
    <QAContainer itemPadding={10} itemWidthAuto>
      <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
        <TabstripNext
          {...tabstripProps}
          selectedTab={selectedTab}
          onSelectTab={(_, tab) => setSelectedTab(tab)}
        >
          {tabs.map((label) => (
            <TabNext label={label} key={label} value={label}>
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
