import { BorderLayout, BorderItem } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";

export default {
  title: "Layout/BorderLayout",
  component: BorderLayout,
  subcomponents: { BorderItem },
} as ComponentMeta<typeof BorderLayout>;

type ItemProps = { width?: number | string; height?: number | string };

const HeaderItem = ({ width, height }: ItemProps) => (
  <div className="border-item border-header" style={{ width, height }}>
    <p>Header</p>
  </div>
);

const LeftItem = ({ width, height }: ItemProps) => (
  <div className="border-item border-left" style={{ width, height }}>
    <p>Left</p>
  </div>
);

const MainItem = ({ width, height }: ItemProps) => (
  <div
    className="border-item border-main"
    style={{
      minWidth: 100,
      width,
      height,
    }}
  >
    <p>Main</p>
  </div>
);

const RightItem = ({ width, height }: ItemProps) => (
  <div className="border-item border-right" style={{ width, height }}>
    <p>Right</p>
  </div>
);

const BottomItem = ({ width, height }: ItemProps) => (
  <div className="border-item border-bottom" style={{ width, height }}>
    <p>Bottom</p>
  </div>
);

const Template: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="header">
        <HeaderItem />
      </BorderItem>
      <BorderItem position="left">
        <LeftItem />
      </BorderItem>
      <BorderItem position="main">
        <MainItem />
      </BorderItem>
      <BorderItem position="right">
        <RightItem />
      </BorderItem>
      <BorderItem position="bottom">
        <BottomItem />
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayout = Template.bind({});
ToolkitBorderLayout.args = {};

ToolkitBorderLayout.argTypes = {
  gap: {
    type: "number",
  },
  columnGap: {
    type: "number",
  },
  rowGap: {
    type: "number",
  },
};

const NoRightPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="header">
        <HeaderItem />
      </BorderItem>
      <BorderItem position="left">
        <LeftItem />
      </BorderItem>
      <BorderItem position="main">
        <MainItem />
      </BorderItem>
      <BorderItem position="bottom">
        <BottomItem />
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoRightPanel = NoRightPanel.bind({});
ToolkitBorderLayoutNoRightPanel.args = {};

ToolkitBorderLayoutNoRightPanel.argTypes = {
  gap: {
    type: "number",
  },
  columnGap: {
    type: "number",
  },
  rowGap: {
    type: "number",
  },
};

const NoLeftPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="header">
        <HeaderItem />
      </BorderItem>
      <BorderItem position="main">
        <MainItem />
      </BorderItem>
      <BorderItem position="right">
        <RightItem />
      </BorderItem>
      <BorderItem position="bottom">
        <BottomItem />
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoLeftPanel = NoLeftPanel.bind({});
ToolkitBorderLayoutNoLeftPanel.args = {};

ToolkitBorderLayoutNoLeftPanel.argTypes = {
  gap: {
    type: "number",
  },
  columnGap: {
    type: "number",
  },
  rowGap: {
    type: "number",
  },
};

const NoHeader: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="left">
        <LeftItem />
      </BorderItem>
      <BorderItem position="main">
        <MainItem />
      </BorderItem>
      <BorderItem position="right">
        <RightItem />
      </BorderItem>
      <BorderItem position="bottom">
        <BottomItem />
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoHeader = NoHeader.bind({});
ToolkitBorderLayoutNoHeader.args = {};

ToolkitBorderLayoutNoHeader.argTypes = {
  gap: {
    type: "number",
  },
  columnGap: {
    type: "number",
  },
  rowGap: {
    type: "number",
  },
};

const FixedPanels: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args} style={{ width: "80vw" }}>
      <BorderItem position="header">
        <HeaderItem height={50} />
      </BorderItem>
      <BorderItem position="left">
        <LeftItem width={100} height={200} />
      </BorderItem>
      <BorderItem position="main">
        <MainItem height="100%" />
      </BorderItem>
      <BorderItem position="right">
        <RightItem width={100} height={200} />
      </BorderItem>
      <BorderItem position="bottom">
        <BottomItem height={50} />
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutFixedPanels = FixedPanels.bind({});
ToolkitBorderLayoutFixedPanels.args = {};

ToolkitBorderLayoutFixedPanels.argTypes = {
  gap: {
    type: "number",
  },
  columnGap: {
    type: "number",
  },
  rowGap: {
    type: "number",
  },
};

/**
 * TODO: Add real life examples once other components have been implemented
 * https://1b605bc7.ui-toolkit-staging.pages.dev/?path=/story/layout-borderlayout--toolkit-border-layout-page
 * https://1b605bc7.ui-toolkit-staging.pages.dev/?path=/story/layout-borderlayout--toolkit-border-layout-metrics-example
 */
