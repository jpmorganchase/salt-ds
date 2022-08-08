import type { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import { List } from "@jpmorganchase/uitk-lab";

import { usa_states } from "./list.data";

import "./list.stories.css";

export default {
  title: "Lab/List/QA",
  component: List,
} as ComponentMeta<typeof List>;

export const AllExamples: Story<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={4} height={950} imgSrc={imgSrc} itemPadding={5}>
    <List
      aria-label="Listbox example"
      displayedItemCount={5}
      highlightedIndex={1}
      defaultSelected={usa_states[2]}
      source={usa_states.slice(0, 5)}
    />
    <List
      aria-label="Listbox example"
      displayedItemCount={5}
      highlightedIndex={1}
      defaultSelected={[usa_states[2], usa_states[3]]}
      selectionStrategy="multiple"
      source={usa_states}
    />
    <List
      aria-label="Listbox example"
      displayedItemCount={5}
      highlightedIndex={4}
      defaultSelected={usa_states[2]}
      source={usa_states}
      width={70}
    />
    <List
      aria-label="Listbox example"
      borderless
      displayedItemCount={5}
      highlightedIndex={1}
      source={usa_states}
    />
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithBaseline: Story = () => {
  return (
    <AllExamples imgSrc="/visual-regression-screenshots/List-vr-snapshot.png" />
  );
};
