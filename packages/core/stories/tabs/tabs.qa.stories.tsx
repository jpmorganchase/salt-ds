import { TabList } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { useState } from "react";
import "./tabs.stories.css";

export default {
  title: "Core/Tabs/Tabs QA",
  component: TabList,
};

const _tabs = [
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
  const [_value, _setValue] = useState<string | undefined>("Home");
  return <QAContainer itemPadding={10} cols={2} />;
};

LotsOfTabsTabstrip.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
