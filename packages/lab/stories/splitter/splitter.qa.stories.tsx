import { FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { SplitHandle, SplitPanel, Splitter } from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { QAContainer } from "docs/components";

export default {
  title: "Lab/Splitter/Splitter QA",
  component: Splitter,
  subcomponents: { SplitPanel, SplitHandle },
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
          <SplitPanel>
            <Text>Panel 1</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <Text>Panel 2</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <Text>Panel 3</Text>
          </SplitPanel>
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
          <SplitPanel>
            <Text>Panel 1</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <Text>Panel 2</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <Text>Panel 3</Text>
          </SplitPanel>
        </Splitter>
      </FlexLayout>
    </QAContainer>
  );
}
