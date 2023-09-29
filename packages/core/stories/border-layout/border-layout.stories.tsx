import { BorderItem, BorderLayout } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Border Layout",
  component: BorderLayout,
  subcomponents: { BorderItem },
  argTypes: {
    as: { type: "string" },
    gap: {
      type: "number",
    },
    columnGap: {
      type: "number",
    },
    rowGap: {
      type: "number",
    },
    children: { control: { type: null } },
  },
} as Meta<typeof BorderLayout>;

const Template: StoryFn<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>North</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>West</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Center</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>East</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>South</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const AllPanels = Template.bind({});
AllPanels.args = {};

const NoRightPanelTemplate: StoryFn<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>North</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>West</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Center</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>South</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const NoRightPanel = NoRightPanelTemplate.bind({});
NoRightPanel.args = {};

const NoLeftPanelTemplate: StoryFn<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>North</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Center</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>East</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>South</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const NoLeftPanel = NoLeftPanelTemplate.bind({});
NoLeftPanel.args = {};

const NoHeaderTemplate: StoryFn<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>West</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Center</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>East</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>South</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const NoHeader = NoHeaderTemplate.bind({});
NoHeader.args = {};

const FixedPanelsTemplate: StoryFn<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args} style={{ width: "60vw" }}>
      <BorderItem position="north">
        <div className="border-item border-header" style={{ height: 50 }}>
          <p>North</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div
          className="border-item border-left"
          style={{ width: 100, height: 200 }}
        >
          <p>West</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
            height: "100%",
          }}
        >
          <p>Center</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div
          className="border-item border-right"
          style={{ width: 100, height: 200 }}
        >
          <p>East</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom" style={{ height: 50 }}>
          <p>South</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const FixedPanels = FixedPanelsTemplate.bind({});
FixedPanels.args = {};
