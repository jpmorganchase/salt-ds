import {
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  FloatingComponentProvider,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  InlineFloatingComponent,
  QAContainer,
  type QAContainerProps,
} from "docs/components";
import "./drawer.qa.stories.css";
import {
  type ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { userEvent, waitFor, within } from "storybook/test";

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

const DrawerTemplate = () => {
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
        <FakeDrawer>
          <DrawerHeader header="Title without actions" />
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

const DrawerOverflowTemplate = () => {
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

const resizableDrawerStyle = (position: DrawerProps["position"]) =>
  position === "left" || position === "right"
    ? { width: 300 }
    : { height: 220 };

const ResizableDrawerFrame = ({
  position,
  resizable = true,
  drawerRef,
  className,
  children,
}: Pick<DrawerProps, "position" | "resizable" | "children" | "className"> & {
  drawerRef?: Ref<HTMLDivElement>;
}) => (
  // `contain: layout` positions the fixed drawer within this frame instead of the viewport.
  <div
    className={className}
    style={{ width: 440, height: 340, contain: "layout" }}
  >
    <Drawer
      className="noAnimation"
      open
      resizable={resizable}
      disableScrim
      position={position}
      ref={drawerRef}
      style={resizableDrawerStyle(position)}
    >
      {children}
    </Drawer>
  </div>
);

const ResizableDrawerSections = ({
  disableAccent,
  header = "Title",
}: {
  disableAccent?: boolean;
  header?: string;
}) => (
  <>
    <DrawerHeader
      header={header}
      actions={<CloseButton />}
      disableAccent={disableAccent}
    />
    <DrawerContent>
      <Text>{loremText}</Text>
      <Text>{loremText}</Text>
      <Text>{loremText}</Text>
    </DrawerContent>
    <DrawerFooter>
      <Button sentiment="accented">Save</Button>
    </DrawerFooter>
  </>
);

const ResizableDrawerTemplate = ({
  position,
}: Pick<DrawerProps, "position">) => (
  <ResizableDrawerFrame position={position}>
    <ResizableDrawerSections />
  </ResizableDrawerFrame>
);

export const DrawerResizable: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <FloatingComponentProvider Component={InlineFloatingComponent}>
      <QAContainer
        cols={2}
        height="auto"
        itemPadding={20}
        itemWidthAuto
        width={2000}
        {...rest}
      >
        <ResizableDrawerTemplate position="left" />
        <ResizableDrawerTemplate position="right" />
        <ResizableDrawerTemplate position="top" />
        <ResizableDrawerTemplate position="bottom" />
      </QAContainer>
    </FloatingComponentProvider>
  );
};
DrawerResizable.parameters = {
  chromatic: { disableSnapshot: false },
};

export const DrawerResizableAccent: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <FloatingComponentProvider Component={InlineFloatingComponent}>
      <QAContainer
        cols={3}
        height="auto"
        itemPadding={20}
        itemWidthAuto
        width={1500}
        {...rest}
      >
        <ResizableDrawerFrame position="right">
          <ResizableDrawerSections header="Default" />
        </ResizableDrawerFrame>
        <ResizableDrawerFrame position="right">
          <ResizableDrawerSections
            header="Accent enabled"
            disableAccent={false}
          />
        </ResizableDrawerFrame>
        <ResizableDrawerFrame position="right" resizable={false}>
          <ResizableDrawerSections header="Not resizable" />
        </ResizableDrawerFrame>
      </QAContainer>
    </FloatingComponentProvider>
  );
};
DrawerResizableAccent.parameters = {
  chromatic: { disableSnapshot: false },
};

const ScrolledResizableDrawerTemplate = ({
  position,
}: Pick<DrawerProps, "position">) => {
  const [drawer, setDrawer] = useState<HTMLDivElement | null>(null);

  // Scrolls the block up to the handle. Must run after the drawer measures its size limits, which resets the scroll.
  useEffect(() => {
    const scroller = drawer?.querySelector<HTMLElement>(".saltDrawer-inner");
    if (!scroller) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = Math.round(max / 2);
  }, [drawer]);

  return (
    <ResizableDrawerFrame
      position={position}
      drawerRef={setDrawer}
      className="hitArea"
    >
      <div
        style={{
          height: 600,
          flexShrink: 0,
          background: "var(--salt-sentiment-accent-background)",
        }}
      />
    </ResizableDrawerFrame>
  );
};

export const DrawerResizableHitArea: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <FloatingComponentProvider Component={InlineFloatingComponent}>
      <QAContainer
        cols={2}
        height="auto"
        itemPadding={20}
        itemWidthAuto
        width={2000}
        {...rest}
      >
        <ScrolledResizableDrawerTemplate position="left" />
        <ScrolledResizableDrawerTemplate position="right" />
        <ScrolledResizableDrawerTemplate position="top" />
        <ScrolledResizableDrawerTemplate position="bottom" />
      </QAContainer>
    </FloatingComponentProvider>
  );
};
DrawerResizableHitArea.parameters = {
  chromatic: { disableSnapshot: false },
};

const ResizableDrawerGuideTemplate = ({
  position,
}: Pick<DrawerProps, "position">) => (
  <Drawer
    className="noAnimation"
    open
    resizable
    position={position}
    style={resizableDrawerStyle(position)}
  >
    <ResizableDrawerSections />
  </Drawer>
);

// The drawer covers the viewport, so dark mode needs its own Chromatic modes.
const guideChromaticParameters = {
  disableSnapshot: false,
  modes: {
    "legacy dark": { theme: "legacy", mode: "dark" },
    "brand dark": { theme: "brand", mode: "dark" },
  },
};

// Clicks the handle to start placing the edge, then moves the guide line to the given point.
const playGuide =
  (coords: { clientX: number; clientY: number }) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const ownerDocument = canvasElement.ownerDocument;
    const handle = await within(ownerDocument.body).findByRole("separator", {
      name: "Resize drawer",
    });
    await userEvent.click(handle);
    const guide = await waitFor(() => {
      const element = ownerDocument.querySelector(".saltDrawerResizeGuide");
      if (!element) throw new Error("The guide line isn't showing");
      return element;
    });
    await userEvent.pointer({ target: guide, coords });
  };

export const DrawerResizableGuideLeft: StoryFn = () => (
  <ResizableDrawerGuideTemplate position="left" />
);
DrawerResizableGuideLeft.parameters = {
  chromatic: guideChromaticParameters,
};
DrawerResizableGuideLeft.play = playGuide({ clientX: 500, clientY: 300 });

export const DrawerResizableGuideTop: StoryFn = () => (
  <ResizableDrawerGuideTemplate position="top" />
);
DrawerResizableGuideTop.parameters = {
  chromatic: guideChromaticParameters,
};
DrawerResizableGuideTop.play = playGuide({ clientX: 500, clientY: 400 });
