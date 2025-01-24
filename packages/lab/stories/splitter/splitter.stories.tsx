import { FlexLayout } from "@salt-ds/core";
import { Splitter, Split, SplitHandle } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Splitter",
  components: Splitter,
  subcomponents: { Split, SplitHandle },
} as Meta<typeof Splitter>;

export const Horizontal: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{ width: 420, height: 240, border: "2px solid lightgrey" }}
    >
      <Splitter direction="horizontal">
        <Split>Left</Split>
        <SplitHandle />
        <Split>Right</Split>
      </Splitter>
    </FlexLayout>
  );
};

export const Vertical: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{ width: 420, height: 240, border: "2px solid lightgrey" }}
    >
      <Splitter direction="vertical">
        <Split>Top</Split>
        <SplitHandle />
        <Split>Bottom</Split>
      </Splitter>
    </FlexLayout>
  );
};
