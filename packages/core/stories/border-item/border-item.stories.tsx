import { BorderLayout, BorderItem } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
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
        <p>North</p>
      </BorderItem>
      <BorderItem {...args} className="border-item layout-active-content">
        <p>{args.position}</p>
      </BorderItem>
      <BorderItem
        position="center"
        className="border-item layout-content"
        style={{ minWidth: 100 }}
      >
        <p>Center</p>
      </BorderItem>
      <BorderItem position="east" className="border-item">
        <p>East</p>
      </BorderItem>
      <BorderItem position="south" className="border-item">
        <p>South</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderItemWrapper = Template.bind({});
BorderItemWrapper.args = { position: "west", sticky: true };
