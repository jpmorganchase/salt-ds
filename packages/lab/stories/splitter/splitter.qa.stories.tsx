import { FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { Split, SplitHandle, Splitter } from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { QAContainer } from "docs/components";

export default {
  title: "Lab/Splitter/Splitter QA",
  component: Splitter,
  subcomponents: { Split, SplitHandle },
} as Meta<typeof Splitter>;

const box = {
  width: 240,
  height: 80,
  border: "1px solid lightgrey",
};

const altBox = {
  width: 80,
  height: 240,
  border: "1px solid lightgrey",
};

export function Horizontal() {
  return (
    <QAContainer>
      <StackLayout>
        <Splitter orientation="horizontal" style={box}>
          <Split>
            <Text>Panel 1</Text>
          </Split>
          <SplitHandle />
          <Split>
            <Text>Panel 2</Text>
          </Split>
          <SplitHandle />
          <Split>
            <Text>Panel 3</Text>
          </Split>
        </Splitter>
      </StackLayout>
    </QAContainer>
  );
}

export function Vertical() {
  return (
    <QAContainer>
      <FlexLayout style={altBox}>
        <Splitter orientation="vertical">
          <Split>
            <Text>Panel 1</Text>
          </Split>
          <SplitHandle />
          <Split>
            <Text>Panel 2</Text>
          </Split>
          <SplitHandle />
          <Split>
            <Text>Panel 3</Text>
          </Split>
        </Splitter>
      </FlexLayout>
    </QAContainer>
  );
}
