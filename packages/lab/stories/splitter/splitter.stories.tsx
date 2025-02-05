import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
} from "@salt-ds/icons";
import {
  type ImperativePanelHandle,
  SplitHandle,
  SplitPanel,
  Splitter,
} from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { type CSSProperties, useRef, useState } from "react";

export default {
  title: "Lab/Splitter",
  components: Splitter,
  subcomponents: {
    SplitPanel,
    SplitHandle,
  },
} as Meta<typeof Splitter>;

const center = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
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
      <SplitPanel style={center}>
        <Text>Left</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>
        <Text>Center</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function Vertical() {
  return (
    <Splitter style={box} orientation="vertical" appearance="bordered">
      <SplitPanel style={center}>
        <Text>Top</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>
        <Text>Middle</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>
        <Text>Bottom</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function MultiBordered() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <SplitPanel>
        <Splitter orientation="vertical">
          <SplitPanel style={center}>
            <Text>Top Left</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel style={center}>
            <Text>Middle Left</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel style={center}>
            <Text>Bottom Left</Text>
          </SplitPanel>
        </Splitter>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel>
        <Splitter orientation="vertical">
          <SplitPanel style={center}>
            <Text>Top Right</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel style={center}>
            <Text>Bottom Right</Text>
          </SplitPanel>
        </Splitter>
      </SplitPanel>
    </Splitter>
  );
}

export function Transparent() {
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
        <SplitPanel>
          <Splitter orientation="vertical">
            <SplitPanel style={center}>
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel style={center}>
              <Text>Middle Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel style={center}>
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="vertical">
            <SplitPanel style={center}>
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel style={center}>
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Accent() {
  return (
    <Splitter orientation="horizontal" style={box}>
      <SplitPanel defaultSize={25} style={center}>
        <Text>Left</Text>
      </SplitPanel>
      <SplitHandle accent="right" />
      <SplitPanel style={center}>
        <Text>Center</Text>
      </SplitPanel>
      <SplitHandle accent="left" />
      <SplitPanel defaultSize={25} style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function Variant() {
  return (
    <Splitter orientation="horizontal" style={box}>
      <SplitPanel variant="secondary" defaultSize={25} style={center}>
        <Text>Left</Text>
      </SplitPanel>
      <SplitHandle accent="right" variant="secondary" />
      <SplitPanel style={center}>
        <Text>Center</Text>
      </SplitPanel>
      <SplitHandle accent="left" variant="secondary" />
      <SplitPanel variant="secondary" defaultSize={25} style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function VariantAlt() {
  return (
    <Splitter orientation="horizontal" style={box}>
      <SplitPanel defaultSize={25} style={center}>
        <Text>Left</Text>
      </SplitPanel>
      <SplitHandle accent="left" variant="tertiary" />
      <SplitPanel style={center} variant="tertiary">
        <Text>Center</Text>
      </SplitPanel>
      <SplitHandle accent="right" variant="tertiary" />
      <SplitPanel defaultSize={25} style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function MinMaxSize() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <SplitPanel minSize={20} style={center}>
        <Text>Left [20%, X]</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel minSize={40} maxSize={60} style={center}>
        <Text>Middle [30%, 60%]</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel minSize={20} style={center}>
        <Text>Right [20%, X]</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function CollapsibleFixedSizing() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <SplitPanel
        collapsible
        collapsedSize={15}
        minSize={30}
        maxSize={30}
        style={center}
      >
        <Text style={center}>Left</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function Collapsible0() {
  return (
    <Splitter style={box} orientation="horizontal" appearance="bordered">
      <SplitPanel collapsible collapsedSize={0} minSize={30} style={center}>
        <Text>Left</Text>
      </SplitPanel>
      <SplitHandle />
      <SplitPanel collapsible collapsedSize={0} minSize={30} style={center}>
        <Text>Right</Text>
      </SplitPanel>
    </Splitter>
  );
}

export function CollapseButton() {
  const ref = useRef<ImperativePanelHandle>(null);
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
      <SplitPanel
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
      </SplitPanel>
      <SplitHandle />
      <SplitPanel style={center}>Content</SplitPanel>
    </Splitter>
  );
}

export function CollapseDoubleClick() {
  const ref = useRef<ImperativePanelHandle>(null);

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
      <SplitPanel
        ref={ref}
        collapsible
        collapsedSize={0}
        minSize={30}
        style={center}
      >
        <Text style={center}>
          Double Click the handle <ArrowRightIcon />
        </Text>
      </SplitPanel>
      <SplitHandle onDoubleClick={toggle} />
      <SplitPanel style={center}>
        <Text style={center}>
          <ArrowLeftIcon /> Double Click the handle
        </Text>
      </SplitPanel>
    </Splitter>
  );
}

export function ProgrammableResize() {
  const ref = useRef<ImperativePanelHandle>(null);

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
          <SplitPanel ref={ref} style={center}>
            <Text>Left</Text>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel style={center}>
            <Text>Right</Text>
          </SplitPanel>
        </Splitter>
      </StackLayout>
    </FlexLayout>
  );
}
