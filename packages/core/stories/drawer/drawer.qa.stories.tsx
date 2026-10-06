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
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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

const ResizableDrawerTemplate = ({
  position,
  resizable = true,
}: Pick<DrawerProps, "position" | "resizable">) => {
  const horizontal = position === "left" || position === "right";
  return (
    <Drawer
      open
      resizable={resizable}
      position={position}
      style={horizontal ? { width: 350 } : { height: 280 }}
    >
      <DrawerHeader
        header="Resizable drawer"
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
    </Drawer>
  );
};

export const NotResizable: StoryFn = () => (
  <ResizableDrawerTemplate position="left" resizable={false} />
);
NotResizable.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableLeft: StoryFn = () => (
  <ResizableDrawerTemplate position="left" />
);
ResizableLeft.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableRight: StoryFn = () => (
  <ResizableDrawerTemplate position="right" />
);
ResizableRight.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableTop: StoryFn = () => (
  <ResizableDrawerTemplate position="top" />
);
ResizableTop.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableBottom: StoryFn = () => (
  <ResizableDrawerTemplate position="bottom" />
);
ResizableBottom.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableScrolledUnsectioned: StoryFn = () => {
  const [drawer, setDrawer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!drawer) return;
    const frame = requestAnimationFrame(() => {
      drawer.scrollTop = 400;
    });
    return () => cancelAnimationFrame(frame);
  }, [drawer]);

  return (
    <Drawer
      open
      resizable
      initialFocus={-1}
      style={{ width: 350 }}
      ref={setDrawer}
    >
      <Text>{loremText.repeat(20)}</Text>
    </Drawer>
  );
};
ResizableScrolledUnsectioned.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ResizableAtMinimumSize: StoryFn = () => (
  <Drawer
    open
    resizable
    style={
      {
        width: 0,
        padding: 0,
        "--saltDrawer-minWidth": "0px",
      } as CSSProperties
    }
  >
    <DrawerHeader header="Resizable drawer" />
    <DrawerContent>
      <Text>{loremText}</Text>
    </DrawerContent>
  </Drawer>
);
ResizableAtMinimumSize.parameters = {
  chromatic: { disableSnapshot: false },
};
