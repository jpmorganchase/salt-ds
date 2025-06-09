import { Divider, StackLayout } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Divider/Divider QA",
  component: Divider,
} as Meta<typeof Divider>;

export const DividerExamples: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
    <StackLayout style={{ width: 100 }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>
    <StackLayout direction="row" style={{ height: 100 }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
    <StackLayout style={{ width: 100 }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>
    <StackLayout direction="row">
      <Divider orientation="vertical" style={{ height: 100 }} />
      <Divider
        orientation="vertical"
        variant="secondary"
        style={{ height: 100 }}
      />
      <Divider
        orientation="vertical"
        variant="tertiary"
        style={{ height: 100 }}
      />
    </StackLayout>
    <StackLayout>
      <Divider style={{ width: 60 }} />
      <Divider style={{ width: 60 }} variant="secondary" />
      <Divider style={{ width: 60 }} variant="tertiary" />
    </StackLayout>
    <StackLayout direction="row">
      <Divider style={{ height: 100 }} orientation="vertical" />
      <Divider
        style={{ height: 100 }}
        orientation="vertical"
        variant="secondary"
      />
      <Divider
        style={{ height: 100 }}
        orientation="vertical"
        variant="tertiary"
      />
    </StackLayout>
  </QAContainer>
);

DividerExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
