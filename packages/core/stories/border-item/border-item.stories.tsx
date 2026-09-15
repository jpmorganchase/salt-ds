import { BorderItem, BorderLayout, Text } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";
export default {
  title: "Core/Layout/Border Layout/Border Item",
  component: BorderItem,
  argTypes: {
    as: { type: "string" },
    position: {
      control: { type: "select" },
    },
  },
} as Meta<typeof BorderItem>;

const Template: StoryFn<typeof BorderItem> = (args) => {
  return (
    <BorderLayout columnGap={1} rowGap={1} className="layout-container">
      <BorderItem position="north" className="border-item">
        <Text>North</Text>
      </BorderItem>
      <BorderItem {...args} className="border-item layout-active-content">
        <Text>{args.position}</Text>
      </BorderItem>
      <BorderItem
        position="center"
        className="border-item layout-content"
        style={{ minWidth: 100 }}
      >
        <Text>Center</Text>
      </BorderItem>
      <BorderItem position="east" className="border-item">
        <Text>East</Text>
      </BorderItem>
      <BorderItem position="south" className="border-item">
        <Text>South</Text>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderItemWrapper = Template.bind({});
BorderItemWrapper.args = { position: "west", sticky: true };
