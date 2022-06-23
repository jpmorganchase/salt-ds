import { BorderLayout, BorderItem } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";
export default {
  title: "Lab/Layout/BorderLayout/BorderItem",
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

type ItemProps = {
  width?: number | string;
  height?: number | string;
  position?: string;
};

const HeaderItem = ({ width, height }: ItemProps) => (
  <div className="border-item layout-content" style={{ width, height }}>
    <p>Header</p>
  </div>
);

const MovingItem = ({ width, height, position }: ItemProps) => (
  <div
    className="border-item layout-active-content"
    style={{ width, height, fontWeight: "bold" }}
  >
    <p>{position}</p>
  </div>
);

const MainItem = ({ width, height }: ItemProps) => (
  <div
    className="border-item layout-content"
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
  <div className="border-item layout-content" style={{ width, height }}>
    <p>Right</p>
  </div>
);

const BottomItem = ({ width, height }: ItemProps) => (
  <div className="border-item layout-content" style={{ width, height }}>
    <p>Bottom</p>
  </div>
);

const Template: ComponentStory<typeof BorderItem> = (args) => {
  return (
    <BorderLayout columnGap={1} rowGap={1}>
      <BorderItem position="header">
        <HeaderItem />
      </BorderItem>
      <BorderItem {...args}>
        <MovingItem position={args.position} />
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
