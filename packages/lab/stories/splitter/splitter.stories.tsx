import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
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
import type { Meta, StoryFn } from "@storybook/react";
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

export const Horizontal: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal">
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
    </FlexLayout>
  );
};

export const Vertical: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="vertical" appearance="bordered">
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
    </FlexLayout>
  );
};

export const MultiBordered: StoryFn<typeof Splitter> = () => {
  return (
    <FlexLayout
      style={{
        width: 420,
        height: 240,
        border: "1px solid lightgrey",
      }}
    >
      <Splitter orientation="horizontal" appearance="bordered">
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
};

export const MultiTransparent: StoryFn<typeof Splitter> = () => {
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
};

export function MinMaxSize() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal" appearance="bordered">
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
    </FlexLayout>
  );
}

export function CollapsibleSetSize() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal" appearance="bordered">
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
    </FlexLayout>
  );
}

export function Collapsible0() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal" appearance="bordered">
        <Split collapsible collapsedSize={0} minSize={30} style={center}>
          <Text>Left</Text>
        </Split>
        <SplitHandle />
        <Split collapsible collapsedSize={0} minSize={30} style={center}>
          <Text>Right</Text>
        </Split>
      </Splitter>
    </FlexLayout>
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
    <Splitter orientation="horizontal" style={box}>
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
    <FlexLayout
      style={{
        width: 640,
        height: 240,
        border: "1px solid lightgrey",
      }}
    >
      <Splitter orientation="horizontal" appearance="bordered">
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
    </FlexLayout>
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
      <StackLayout style={box}>
        <Splitter orientation="horizontal" appearance="bordered">
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
