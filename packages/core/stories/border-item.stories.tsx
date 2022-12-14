import { BorderLayout, BorderItem } from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";
export default {
  title: "Core/Layout/BorderLayout/BorderItem",
  component: BorderItem,
  argTypes: {
    position: {
      control: { type: "select" },
    },
    horizontalAlignment: {
      control: { type: "select" },
    },
    verticalAlignment: {
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof BorderItem>;

const Template: ComponentStory<typeof BorderItem> = (args) => {
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
