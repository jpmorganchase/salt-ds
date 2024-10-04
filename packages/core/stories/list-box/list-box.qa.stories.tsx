import { ListBox, Option, OptionGroup } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import { shortColorData } from "../assets/exampleData";

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
    <ListBox>
      <OptionGroup label="B">
        {shortColorData.slice(0, 4).map((color) => (
          <Option key={color} value={color} />
        ))}
      </OptionGroup>
    </ListBox>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
