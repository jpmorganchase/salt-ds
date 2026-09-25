import {
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import "@salt-ds/react-resizable-panels-theme/index.css";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

const CloseButton = () => (
  <Button aria-label="Close drawer" appearance="transparent">
    <CloseIcon aria-hidden />
  </Button>
);

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
            actions={<CloseButton />}
          />
          <DrawerContent>
            <Text>{loremText}</Text>
            <Text>{loremText}</Text>
          </DrawerContent>
          <DrawerFooter>
            <Button sentiment="accented" appearance="bordered">
              Cancel
            </Button>
            <Button sentiment="accented">Save</Button>
          </DrawerFooter>
        </FakeDrawer>
        <FakeDrawer>
          <DrawerHeader header="Title" actions={<CloseButton />} />
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
          <DrawerHeader actions={<CloseButton />} />
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
            <Button sentiment="accented" appearance="bordered">
              Discard changes
            </Button>
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
        <DrawerHeader header="Scrolled to middle" actions={<CloseButton />} />
        <ScrolledDrawerContent scrollTo="middle">
          <Text>{loremText}</Text>
          <Text>{loremText}</Text>
        </ScrolledDrawerContent>
      </FakeDrawer>
      <FakeDrawer>
        <DrawerHeader header="Scrolled to bottom" actions={<CloseButton />} />
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

/* Pins the Drawer's resize handle against the Splitter handle it mirrors.
   The two stylesheets are deliberate duplicates — core and
   @salt-ds/react-resizable-panels-theme build independently — so these
   snapshots are what catches drift between them. Compares the strip width, the
   dot thumb and the border treatment on both axes. Hover and drag states are
   not snapshotted: both stylesheets take them from the same
   --salt-separable-* tokens. */
function SplitterReference({
  direction,
}: {
  direction: "horizontal" | "vertical";
}) {
  const borders =
    direction === "horizontal"
      ? "resize-handle-salt-border-left resize-handle-salt-border-right"
      : "resize-handle-salt-border-top resize-handle-salt-border-bottom";

  return (
    <div
      className="react-resizable-panels-theme-salt"
      style={{
        width: 260,
        height: 200,
        boxSizing: "border-box",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-bold-borderColor)",
      }}
    >
      <PanelGroup direction={direction}>
        <Panel className="resizable-panel-salt-variant-primary" />
        <PanelResizeHandle className={borders} />
        <Panel className="resizable-panel-salt-variant-primary" />
      </PanelGroup>
    </div>
  );
}

const COMPARISON_DRAWER_SIZE = 220;

export const ResizeHandleVsSplitterHorizontal: StoryFn = () => (
  <div style={{ height: 320 }}>
    <StackLayout
      gap={1}
      style={{ marginLeft: COMPARISON_DRAWER_SIZE + 40, paddingTop: 20 }}
    >
      <Text>Splitter reference</Text>
      <SplitterReference direction="horizontal" />
    </StackLayout>
    <Drawer
      open
      resizable
      disableScrim
      position="left"
      defaultSize={COMPARISON_DRAWER_SIZE}
      resizeHandleBorders={["left", "right"]}
    >
      <DrawerHeader header="Drawer handle" actions={<CloseButton />} />
      <DrawerContent>
        <Text>Handle sits on the inner edge.</Text>
      </DrawerContent>
    </Drawer>
  </div>
);
ResizeHandleVsSplitterHorizontal.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizeHandleVsSplitterVertical: StoryFn = () => (
  <div style={{ height: 460 }}>
    <StackLayout gap={1} style={{ paddingTop: 200 }}>
      <Text>Splitter reference</Text>
      <SplitterReference direction="vertical" />
    </StackLayout>
    <Drawer
      open
      resizable
      disableScrim
      position="top"
      defaultSize={180}
      resizeHandleBorders={["top", "bottom"]}
    >
      <DrawerHeader header="Drawer handle" actions={<CloseButton />} />
      <DrawerContent>
        <Text>Handle sits on the inner edge.</Text>
      </DrawerContent>
    </Drawer>
  </div>
);
ResizeHandleVsSplitterVertical.parameters = {
  chromatic: { disableSnapshot: false },
};
