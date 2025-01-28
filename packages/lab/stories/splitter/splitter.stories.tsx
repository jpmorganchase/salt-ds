import { FlexLayout, Text } from "@salt-ds/core";
import { Splitter, Split, SplitHandle } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Splitter",
  components: Splitter,
  subcomponents: { Split, SplitHandle },
} as Meta<typeof Splitter>;

const center = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  background: "#FFF",
};

export const Horizontal: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{ width: 420, height: 240, border: "1px solid lightgrey" }}
    >
      <Splitter orientation="horizontal">
        <Split style={center}>
          <Text>Left</Text>
        </Split>
        <SplitHandle divider />
        <Split style={center}>
          <Text>Right</Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
};

export const Vertical: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{
        width: 420,
        height: 240,
        border: "1px solid var(--salt-separable-tertiary-borderColor)",
      }}
    >
      <Splitter orientation="vertical">
        <Split style={center}>
          <Text>Top</Text>
        </Split>
        <SplitHandle divider />
        <Split style={center}>
          <Text>Bottom</Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
};

export const MultiOrientational: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{
        width: 420,
        height: 240,
        border: "1px solid lightgrey",
      }}
    >
      <Splitter orientation="horizontal">
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Left</Text>
            </Split>
            <SplitHandle divider />
            <Split style={center}>
              <Text>Bottom Left</Text>
            </Split>
          </Splitter>
        </Split>
        <SplitHandle divider />
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Right</Text>
            </Split>
            <SplitHandle divider />
            <Split style={center}>
              <Text>Bottom Right</Text>
            </Split>
          </Splitter>
        </Split>
      </Splitter>
    </FlexLayout>
  );
};

export function SeeThrough() {
  return (
    <FlexLayout
      style={{
        width: 420,
        height: 240,
        padding: 40,
        background: "lightblue",
      }}
    >
      <Splitter orientation="horizontal">
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Left</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Left</Text>
            </Split>
          </Splitter>
        </Split>
        <SplitHandle />
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Right</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Right</Text>
            </Split>
          </Splitter>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
