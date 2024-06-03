import { Divider } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { StackLayout } from "@salt-ds/core";

export default {
  title: "Lab/Divider/Divider QA",
  component: Divider,
} as Meta<typeof Divider>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer
    transposeDensity
    height={500}
    width={1000}
    cols={4}
    itemPadding={8}
    {...props}
  >
    <StackLayout style={{ width: 200 }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>

    <StackLayout direction="row" style={{ height: 200 }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
