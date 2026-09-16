import { Drawer, type DrawerProps } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

function _FakeDrawer({ children, ...rest }: DrawerProps) {
  return (
    <div
      style={{
        width: 350,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export const DrawerExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return <QAContainer height={2000} itemPadding={20} width={1000} {...rest} />;
};
DrawerExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
