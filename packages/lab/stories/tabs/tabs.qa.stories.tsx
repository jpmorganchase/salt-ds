import { Tabstrip } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import "docs/story.css";

export default {
  title: "Lab/Tabs/QA",
  component: Tabstrip,
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
QA.parameters = {
  chromatic: { disableSnapshot: false },
};
