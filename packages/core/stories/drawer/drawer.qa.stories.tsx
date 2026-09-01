import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  type DrawerProps,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { type ReactNode, useLayoutEffect, useRef } from "react";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

function FakeDrawer({ children, ...rest }: DrawerProps) {
  return (
    <div
      style={{
        width: 350,
        height: 280,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--salt-container-primary-background)",
        boxShadow: "var(--salt-overlayable-shadow-modal)",
      }}
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

function ScrolledDrawerContent({
  children,
  scrollTo,
}: {
  children: ReactNode;
  scrollTo: "middle" | "bottom";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroller = ref.current?.querySelector<HTMLElement>(
      ".saltDrawerContent-inner",
    );
    if (!scroller) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = scrollTo === "bottom" ? max : Math.round(max / 2);
  }, [scrollTo]);

  return <DrawerContent ref={ref}>{children}</DrawerContent>;
}

const DrawerOverflowTemplate: StoryFn<typeof Drawer> = () => {
  return (
    <StackLayout direction="row" gap={3}>
      <FakeDrawer>
        <DrawerHeader
          header="Scrolled to middle"
          actions={<DrawerCloseButton />}
        />
        <ScrolledDrawerContent scrollTo="middle">
          <Text>{loremText}</Text>
          <Text>{loremText}</Text>
        </ScrolledDrawerContent>
      </FakeDrawer>
      <FakeDrawer>
        <DrawerHeader
          header="Scrolled to bottom"
          actions={<DrawerCloseButton />}
        />
        <ScrolledDrawerContent scrollTo="bottom">
          <Text>{loremText}</Text>
          <Text>{loremText}</Text>
        </ScrolledDrawerContent>
      </FakeDrawer>
    </StackLayout>
  );
};

export const DrawerOverflow: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer cols={1} height={1600} itemPadding={20} width={1700} {...rest}>
      <DrawerOverflowTemplate />
    </QAContainer>
  );
};
DrawerOverflow.parameters = {
  chromatic: { disableSnapshot: false },
};
