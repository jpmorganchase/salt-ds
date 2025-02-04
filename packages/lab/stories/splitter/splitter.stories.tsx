import {
  Button,
  DialogCloseButton,
  Drawer,
  FlexLayout,
  StackLayout,
  Text,
} from "@salt-ds/core";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
} from "@salt-ds/icons";
import {
  type ImperativeSplitHandle,
  Split,
  SplitHandle,
  Splitter,
} from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { type CSSProperties, useRef, useState } from "react";

export default {
  title: "Lab/Splitter",
  components: Splitter,
  subcomponents: { Split, SplitHandle },
} as Meta<typeof Splitter>;

const center = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  background: "#FFF",
  textAlign: "center",
} as CSSProperties;

const box = {
  width: 420,
  height: 240,
  border: "1px solid lightgrey",
};

export function Horizontal() {
  return (
    <Splitter style={box} orientation="horizontal">
      <Split style={center}>
        <Text>Left</Text>
      </Split>
      <SplitHandle />
      <Split style={center}>
        <Text>Center</Text>
      </Split>
      <SplitHandle />
      <Split style={center}>
        <Text>Right</Text>
      </Split>
    </Splitter>
  );
}

export function Vertical() {
  return (
    <Splitter style={box} orientation="vertical" appearance="bordered">
      <Split style={center}>
        <Text>Top</Text>
      </Split>
      <SplitHandle />
      <Split style={center}>
        <Text>Middle</Text>
      </Split>
      <SplitHandle />
      <Split style={center}>
        <Text>Bottom</Text>
      </Split>
    </Splitter>
  );
}

export function MultiBordered() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <Split>
        <Splitter orientation="vertical">
          <Split style={center}>
            <Text>Top Left</Text>
          </Split>
          <SplitHandle />
          <Split style={center}>
            <Text>Middle Left</Text>
          </Split>
          <SplitHandle />
          <Split style={center}>
            <Text>Bottom Left</Text>
          </Split>
        </Splitter>
      </Split>
      <SplitHandle />
      <Split>
        <Splitter orientation="vertical">
          <Split style={center}>
            <Text>Top Right</Text>
          </Split>
          <SplitHandle />
          <Split style={center}>
            <Text>Bottom Right</Text>
          </Split>
        </Splitter>
      </Split>
    </Splitter>
  );
}

export function MultiTransparent() {
  return (
    <FlexLayout
      style={{
        ...box,
        padding: "56px",
        background: "lightpink",
        boxSizing: "content-box",
      }}
    >
      <Splitter orientation="horizontal" appearance="transparent">
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Left</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Middle Left</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Left</Text>
            </Split>
          </Splitter>
        </Split>
        <SplitHandle />
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Right</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Right</Text>
            </Split>
          </Splitter>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}

export function MinMaxSize() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <Split minSize={20} style={center}>
        <Text>Left [20%, X]</Text>
      </Split>
      <SplitHandle />
      <Split minSize={40} maxSize={60} style={center}>
        <Text>Middle [30%, 60%]</Text>
      </Split>
      <SplitHandle />
      <Split minSize={20} style={center}>
        <Text>Right [20%, X]</Text>
      </Split>
    </Splitter>
  );
}

export function CollapsibleSetSize() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <Split
        collapsible
        collapsedSize={15}
        minSize={30}
        maxSize={30}
        style={center}
      >
        <Text style={center}>Left</Text>
      </Split>
      <SplitHandle />
      <Split style={center}>
        <Text>Right</Text>
      </Split>
    </Splitter>
  );
}

export function Collapsible0() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <Split collapsible collapsedSize={0} minSize={30} style={center}>
        <Text>Left</Text>
      </Split>
      <SplitHandle />
      <Split collapsible collapsedSize={0} minSize={30} style={center}>
        <Text>Right</Text>
      </Split>
    </Splitter>
  );
}

export function CollapseButton() {
  const ref = useRef<ImperativeSplitHandle>(null);
  const [expanded, setExpanded] = useState(true);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isExpanded } = ref.current;

    if (isExpanded()) {
      collapse();
      setExpanded(false);
    } else {
      expand();
      setExpanded(true);
    }
  }

  return (
    <Splitter style={box} orientation="horizontal">
      <Split
        collapsible
        collapsedSize={15}
        minSize={30}
        maxSize={30}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
        ref={ref}
        style={center}
      >
        <Button appearance="solid" sentiment="neutral" onClick={toggle}>
          {expanded ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
        </Button>
      </Split>
      <SplitHandle />
      <Split style={center}>Content</Split>
    </Splitter>
  );
}

export function CollapseDoubleClick() {
  const ref = useRef<ImperativeSplitHandle>(null);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isExpanded } = ref.current;

    if (isExpanded()) {
      return collapse();
    }

    return expand();
  }

  return (
    <Splitter orientation="horizontal" appearance="bordered" style={box}>
      <Split
        ref={ref}
        collapsible
        collapsedSize={0}
        minSize={30}
        style={center}
      >
        <Text style={center}>
          Double Click the handle <ArrowRightIcon />
        </Text>
      </Split>
      <SplitHandle onDoubleClick={toggle} />
      <Split style={center}>
        <Text style={center}>
          <ArrowLeftIcon /> Double Click the handle
        </Text>
      </Split>
    </Splitter>
  );
}

export function ProgrammableResize() {
  const ref = useRef<ImperativeSplitHandle>(null);

  function handleResizeLeft(size: number) {
    return () => {
      ref.current?.resize(size);
    };
  }

  return (
    <FlexLayout align="center">
      <StackLayout gap={2}>
        <Button onClick={handleResizeLeft(0)}>0 | 100</Button>
        <Button onClick={handleResizeLeft(25)}>25 | 75</Button>
        <Button onClick={handleResizeLeft(50)}>50 | 50</Button>
        <Button onClick={handleResizeLeft(75)}>75 | 25</Button>
        <Button onClick={handleResizeLeft(100)}>100 | 0</Button>
      </StackLayout>
      <StackLayout>
        <Splitter style={box} orientation="horizontal" appearance="bordered">
          <Split ref={ref} style={center}>
            <Text>Left</Text>
          </Split>
          <SplitHandle />
          <Split style={center}>
            <Text>Right</Text>
          </Split>
        </Splitter>
      </StackLayout>
    </FlexLayout>
  );
}

export function WipInsideDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        position="right"
        open={open}
        onOpenChange={setOpen}
        style={{ width: 420, padding: 0 }}
      >
        <DialogCloseButton onClick={() => setOpen(false)} />
        <Splitter orientation="horizontal">
          <Split defaultSize={0} />
          <SplitHandle />
          <Split
            collapsible
            collapsedSize={0}
            minSize={100}
            onCollapse={() => setOpen(false)}
            style={{ padding: "24px" }}
          >
            Hello world!
          </Split>
        </Splitter>
      </Drawer>
    </>
  );
}
