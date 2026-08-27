import {
  Drawer,
  DrawerCloseButton,
  DrawerHeader,
  type DrawerProps,
  H2,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

function FakeDrawer({ children, ...rest }: DrawerProps) {
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

const DrawerTemplate: StoryFn<typeof Drawer> = () => {
  return (
    <StackLayout>
      <FakeDrawer>
        <H2>Title</H2>
        <Text>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </Text>
      </FakeDrawer>
    </StackLayout>
  );
};

export const DrawerExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer height={2000} itemPadding={20} width={1000} {...rest}>
      <DrawerTemplate />
    </QAContainer>
  );
};
DrawerExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

/* Padding matches the real Drawer so the header's accent bar lands on the container edge */
const headerDrawerStyle = {
  width: 350,
  padding: "var(--salt-spacing-300)",
  boxSizing: "border-box",
} as const;

const DrawerHeaderTemplate: StoryFn<typeof Drawer> = () => {
  return (
    <StackLayout>
      <FakeDrawer style={headerDrawerStyle}>
        <DrawerHeader
          preheader="Settlements - Nostros"
          header="Cash breaks"
          description="LOB: Global Derivatives and Cash"
          actions={<DrawerCloseButton />}
        />
        <Text>Drawer content</Text>
      </FakeDrawer>
      <FakeDrawer style={headerDrawerStyle}>
        <DrawerHeader header="Cash breaks" actions={<DrawerCloseButton />} />
      </FakeDrawer>
      <FakeDrawer style={headerDrawerStyle}>
        <DrawerHeader
          disableAccent
          header="Cash breaks"
          actions={<DrawerCloseButton />}
        />
      </FakeDrawer>
      <FakeDrawer style={headerDrawerStyle}>
        <DrawerHeader
          status="warning"
          header="Can't move file"
          description="The destination folder is read-only."
          actions={<DrawerCloseButton />}
        />
      </FakeDrawer>
    </StackLayout>
  );
};

export const DrawerHeaderExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer height={1200} itemPadding={20} width={1000} {...rest}>
      <DrawerHeaderTemplate />
    </QAContainer>
  );
};
DrawerHeaderExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
