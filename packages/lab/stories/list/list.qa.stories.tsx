import { List } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

import { usa_states } from "./list.data";

export default {
  title: "Lab/List/QA",
  component: List,
} as Meta<typeof List>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} height={950} itemPadding={5}>
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
