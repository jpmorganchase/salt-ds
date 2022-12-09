import { BorderItem, BorderLayout } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/Layout/BorderLayout",
  component: BorderLayout,
  subcomponents: { BorderItem },
  argTypes: {
    gap: {
      type: "number",
    },
    columnGap: {
      type: "number",
    },
    rowGap: {
      type: "number",
    },
  },
} as ComponentMeta<typeof BorderLayout>;

const Template: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>Top</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>Left</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Main section</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>Right</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>Bottom</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderLayoutAllPanels = Template.bind({});
BorderLayoutAllPanels.args = {};

const NoRightPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>Top</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>Left</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Main section</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>Bottom</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderLayoutNoRightPanel = NoRightPanel.bind({});
BorderLayoutNoRightPanel.args = {};

const NoLeftPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="north">
        <div className="border-item border-header">
          <p>Top</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Main section</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>Right</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>Bottom</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderLayoutNoLeftPanel = NoLeftPanel.bind({});
BorderLayoutNoLeftPanel.args = {};

const NoHeader: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="west">
        <div className="border-item border-left">
          <p>Left</p>
        </div>
      </BorderItem>
      <BorderItem position="center">
        <div
          className="border-item border-main"
          style={{
            minWidth: 100,
          }}
        >
          <p>Main section</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div className="border-item border-right">
          <p>Right</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom">
          <p>Bottom</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderLayoutNoHeader = NoHeader.bind({});
BorderLayoutNoHeader.args = {};

const FixedPanels: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args} style={{ width: "60vw" }}>
      <BorderItem position="north">
        <div className="border-item border-header" style={{ height: 50 }}>
          <p>Top</p>
        </div>
      </BorderItem>
      <BorderItem position="west">
        <div
          className="border-item border-left"
          style={{ width: 100, height: 200 }}
        >
          <p>Left</p>
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
          <p>Main section</p>
        </div>
      </BorderItem>
      <BorderItem position="east">
        <div
          className="border-item border-right"
          style={{ width: 100, height: 200 }}
        >
          <p>Right</p>
        </div>
      </BorderItem>
      <BorderItem position="south">
        <div className="border-item border-bottom" style={{ height: 50 }}>
          <p>Bottom</p>
        </div>
      </BorderItem>
    </BorderLayout>
  );
};

export const BorderLayoutFixedPanels = FixedPanels.bind({});
BorderLayoutFixedPanels.args = {};
