import { useState } from "react";
import { Story } from "@storybook/react";
import { TabstripNextProps, TabstripNext, TabNext } from "@salt-ds/lab";
import { QAContainer } from "docs/components";
import "./tabstrip-next.stories.css";

export default {
  title: "Lab/Tabs Next/Tabstrip Next/QA",
  component: TabstripNext,
  args: {
    selected: undefined,
    onSelectTab: undefined,
  },
};

type TabstripStory = Story<
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
  const [selected, setSelected] = useState<string | undefined>("Home");
  return (
    <QAContainer itemPadding={10} itemWidthAuto>
      <div style={{ width, minWidth: 0, maxWidth: "100%" }}>
        <TabstripNext
          {...tabstripProps}
          selected={selected}
          onChange={(event, { value }) => {
            setSelected(value);
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
