import {
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  Text,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react";
import { QAContainer } from "docs/components";

export default {
  title: "Core/Splitter/Splitter QA",
  component: Splitter,
  subcomponents: { SplitPanel, SplitHandle },
} as Meta<typeof Splitter>;

import "./splitter.stories.css";

export function Horizontal() {
  return (
    <QAContainer>
      <FlexLayout className="box">
        <Splitter orientation="horizontal">
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

export function Vertical() {
  return (
    <QAContainer>
      <FlexLayout className="box">
        <Splitter orientation="vertical" className="box">
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
