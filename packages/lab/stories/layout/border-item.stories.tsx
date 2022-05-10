import { BorderLayout, BorderItem } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";

export default {
  title: "Layout/BorderItem",
  component: BorderItem,
} as ComponentMeta<typeof BorderItem>;

type ItemProps = { width?: number | string; height?: number | string };

const HeaderItem = ({ width, height }: ItemProps) => (
  <div className="border-item border-header" style={{ width, height }}>
    <p>Header</p>
  </div>
);

const LeftItem = ({ width, height }: ItemProps) => (
  <div
    className="border-item border-left"
    style={{ width, height, fontWeight: "bold" }}
  >
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

const Template: ComponentStory<typeof BorderItem> = (args) => {
  return (
    <BorderLayout>
      <BorderItem position="header">
        <HeaderItem />
      </BorderItem>
      <BorderItem {...args}>
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

export const ToolkitBorderItem = Template.bind({});
ToolkitBorderItem.args = { position: "left", sticky: true };

ToolkitBorderItem.argTypes = {};
