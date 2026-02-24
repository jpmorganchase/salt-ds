import { FlexLayout, FlowLayout, Input, Kbd, Text } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Kbd/Kbd QA",
  component: Kbd,
} as Meta<typeof Kbd>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={5} itemPadding={1} vertical transposeDensity>
    <Kbd>primary</Kbd>
    <Kbd variant="secondary">secondary</Kbd>
    <Kbd variant="tertiary">tertiary</Kbd>
    <FlexLayout gap={0.5} align="center">
      <Text>Press</Text>
      <Kbd>Ctrl</Kbd>
      <Text>+</Text>
      <Kbd>Shift</Kbd>
    </FlexLayout>
    <FlowLayout>
      <Input
        bordered
        placeholder="Search"
        startAdornment={<SearchIcon />}
        endAdornment={
          <FlexLayout gap={0.5} wrap align="center">
            <Kbd>Cmd</Kbd>
            <Kbd>K</Kbd>
          </FlexLayout>
        }
      />
    </FlowLayout>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
