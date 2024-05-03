import { StoryFn } from "@storybook/react";
import { Tabstrip } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

import "docs/story.css";

export default {
  title: "Lab/Tabs/Tabs QA",
  component: Tabstrip,
  chromatic: { disableSnapshot: false, delay: 200 },
};

const initialTabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const QA: StoryFn<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={1} imgSrc={imgSrc} itemPadding={12} width={1200}>
    <Tabstrip source={initialTabs} />
    <Tabstrip centered source={initialTabs} />
    <Tabstrip
      enableAddTab
      source={initialTabs
        .concat(["More Services"])
        .map((label, i) => ({ label, closeable: i > 0 }))}
    />
  </QAContainer>
);
