import type { Meta, StoryFn } from "@storybook/react";
import { ListBox, Option } from "@salt-ds/core";
import { shortColorData } from "../assets/exampleData";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/List box/List box QA",
  component: ListBox,
} as Meta<typeof ListBox>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} transposeDensity width={1200}>
    <ListBox defaultSelected={[shortColorData[0]]}>
      {shortColorData.map((color) => (
        <Option key={color} value={color} />
      ))}
    </ListBox>
    <ListBox
      multiselect
      defaultSelected={[shortColorData[0], shortColorData[1]]}
    >
      {shortColorData.map((color) => (
        <Option key={color} value={color} />
      ))}
    </ListBox>
    <ListBox bordered defaultSelected={[shortColorData[0]]}>
      {shortColorData.map((color) => (
        <Option key={color} value={color} />
      ))}
    </ListBox>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
