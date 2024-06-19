import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { StackLayout, Divider } from "@salt-ds/core";

export default {
  title: "Core/Divider/Divider QA",
  component: Divider,
} as Meta<typeof Divider>;

export const StandaloneHorizontal: StoryFn<QAContainerProps> = (props) => (
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
  </QAContainer>
);

StandaloneHorizontal.parameters = {
  chromatic: { disableSnapshot: false },
};

export const StandaloneVertical: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
    <StackLayout direction="row" style={{ height: 100 }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
  </QAContainer>
);

StandaloneVertical.parameters = {
  chromatic: { disableSnapshot: false },
};

export const FlexHorizontal: StoryFn<QAContainerProps> = (props) => (
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
  </QAContainer>
);

FlexHorizontal.parameters = {
  chromatic: { disableSnapshot: false },
};

export const FlexVertical: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
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
  </QAContainer>
);

FlexVertical.parameters = {
  chromatic: { disableSnapshot: false },
};

export const FlexHorizontalHeight: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
    <StackLayout>
      <Divider style={{ width: 60 }} />
      <Divider style={{ width: 60 }} variant="secondary" />
      <Divider style={{ width: 60 }} variant="tertiary" />
    </StackLayout>
  </QAContainer>
);

FlexHorizontalHeight.parameters = {
  chromatic: { disableSnapshot: false },
};

export const FlexVerticalHeight: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
    <StackLayout direction="row" style={{ height: 100 }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
  </QAContainer>
);

FlexVerticalHeight.parameters = {
  chromatic: { disableSnapshot: false },
};
