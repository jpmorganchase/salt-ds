import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { CSSProperties } from "react";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

function FakeDrawer({ children, ...rest }: DrawerProps) {
  return (
    <div
      style={
        {
          width: 350,
          height: 280,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "--drawer-background": "var(--salt-container-primary-background)",
          background: "var(--drawer-background)",
          boxShadow: "var(--salt-overlayable-shadow-modal)",
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
}

const loremText =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

const DrawerTemplate: StoryFn<typeof Drawer> = () => {
  return (
    <StackLayout gap={3}>
      <StackLayout direction="row" gap={3}>
        <FakeDrawer>
          <DrawerHeader
            preheader="Payments"
            header="Check deposit #1278"
            description="Pending transaction review"
            actions={<DrawerCloseButton />}
          />
          <DrawerContent>
            <Text>{loremText}</Text>
            <Text>{loremText}</Text>
          </DrawerContent>
          <DrawerFooter>
            <Button appearance="transparent">Cancel</Button>
            <Button sentiment="accented">Save</Button>
          </DrawerFooter>
        </FakeDrawer>
        <FakeDrawer>
          <DrawerHeader header="Title" actions={<DrawerCloseButton />} />
          <DrawerContent>
            <Text>{loremText}</Text>
          </DrawerContent>
        </FakeDrawer>
      </StackLayout>
      <StackLayout direction="row" gap={3}>
        <FakeDrawer>
          <DrawerHeader
            disableAccent
            preheader="Payments"
            header="Accent bar disabled"
            description="Pending transaction review"
          />
          <DrawerContent>
            <Text>{loremText}</Text>
          </DrawerContent>
        </FakeDrawer>
        <FakeDrawer>
          <DrawerHeader actions={<DrawerCloseButton />} />
          <DrawerContent>
            <Text>{loremText}</Text>
          </DrawerContent>
          <DrawerFooter>
            <Button sentiment="accented">Save</Button>
          </DrawerFooter>
        </FakeDrawer>
      </StackLayout>
      <StackLayout direction="row" gap={3}>
        <FakeDrawer>
          <DrawerContent>
            <Text>Pending transaction review</Text>
          </DrawerContent>
          <DrawerFooter>
            <Button appearance="transparent">Discard changes</Button>
            <Button sentiment="accented">Save and continue</Button>
          </DrawerFooter>
        </FakeDrawer>
      </StackLayout>
      <StackLayout direction="row" gap={3}>
        <FakeDrawer>
          <DrawerContent>
            <Text>{loremText}</Text>
            <Text>{loremText}</Text>
          </DrawerContent>
        </FakeDrawer>
      </StackLayout>
    </StackLayout>
  );
};

export const DrawerExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer cols={1} height={3900} itemPadding={20} width={1700} {...rest}>
      <DrawerTemplate />
    </QAContainer>
  );
};
DrawerExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
