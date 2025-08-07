import { ListBox, Option, OptionGroup } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { shortColorData } from "../assets/exampleData";

export default {
  title: "Core/List box/List box QA",
  component: ListBox,
} as Meta<typeof ListBox>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} transposeDensity width={1200}>
    <ListBox defaultSelected={[shortColorData[0]]}>
      {shortColorData.map((color, index) => (
        <Option
          key={color}
          disabled={index === 5 || index === 8}
          value={color}
        />
      ))}
    </ListBox>
    <ListBox
      multiselect
      defaultSelected={[shortColorData[0], shortColorData[1]]}
    >
      {shortColorData.map((color, index) => (
        <Option
          key={color}
          disabled={index === 5 || index === 8}
          value={color}
        />
      ))}
    </ListBox>
    <ListBox bordered defaultSelected={[shortColorData[0]]}>
      {shortColorData.map((color, index) => (
        <Option
          key={color}
          disabled={index === 5 || index === 8}
          value={color}
        />
      ))}
    </ListBox>
    <ListBox defaultSelected={[shortColorData[1]]}>
      <OptionGroup label="B">
        {shortColorData.slice(0, 4).map((color, index) => (
          <Option key={color} disabled={index === 2} value={color} />
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
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
