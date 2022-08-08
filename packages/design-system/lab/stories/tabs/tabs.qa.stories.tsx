import { Story } from "@storybook/react";
import { Tabstrip } from "@jpmorganchase/uitk-lab";
import { QAContainer, QAContainerProps } from "docs/components";

import "docs/story.css";

export default {
  title: "Lab/Tabs/QA",
  component: Tabstrip,
};

const initialTabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const QA: Story<QAContainerProps> = ({ imgSrc }) => (
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

export const QABackwardsCompat: Story<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={1} imgSrc={imgSrc} itemPadding={12} width={1200}>
    <Tabstrip source={initialTabs} className="backwardsCompat" />
    <Tabstrip centered source={initialTabs} className="backwardsCompat" />
    <Tabstrip
      className="backwardsCompat"
      enableAddTab
      source={initialTabs
        .concat(["More Services"])
        .map((label, i) => ({ label, closeable: i > 0 }))}
    />
  </QAContainer>
);

QABackwardsCompat.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <QABackwardsCompat imgSrc="/visual-regression-screenshots/Tabs-vr-snapshot.png" />
  );
};
