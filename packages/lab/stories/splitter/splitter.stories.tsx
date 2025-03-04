import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { DoubleChevronLeftIcon, DoubleChevronRightIcon } from "@salt-ds/icons";
import {
  type ImperativePanelHandle,
  SplitHandle,
  SplitPanel,
  Splitter,
} from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { useRef, useState } from "react";

import "./splitter.stories.css";

export default {
  title: "Lab/Splitter",
  components: Splitter,
  subcomponents: {
    SplitPanel,
    SplitHandle,
  },
} as Meta<typeof Splitter>;

export function Horizontal() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="horizontal">
        <SplitPanel id="top" className="center">
          <Text>Top</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Top/Middle" />
        <SplitPanel id="middle" className="center">
          <Text>Middle</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Middle/Bottom" />
        <SplitPanel id="bottom" className="center">
          <Text>Bottom</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Vertical() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel id="left" className="center">
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Left/Center" />
        <SplitPanel id="center" className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Center/Right" />
        <SplitPanel id="right" className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function MultiOrientational() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Middle Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Transparent() {
  return (
    <FlexLayout className="box boxGrey">
      <Splitter orientation="vertical" appearance="transparent">
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Middle Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Border() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel id="left" minSize={0} defaultSize={25} className="center">
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle border="right" />
        <SplitPanel minSize={50} className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle border="left" />
        <SplitPanel minSize={0} defaultSize={25} className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Variant() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel
          variant="secondary"
          minSize={0}
          defaultSize={25}
          className="center"
        >
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle border="right" variant="secondary" />
        <SplitPanel minSize={50} className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle border="left" variant="secondary" />
        <SplitPanel
          variant="secondary"
          minSize={0}
          defaultSize={25}
          className="center"
        >
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Size() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel minSize={20} className="center">
          <Text>Left [20%, X]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="middle" minSize={40} maxSize={60} className="center">
          <Text>Middle [30%, 60%]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel minSize={20} className="center">
          <Text>Right [20%, X]</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function CollapsibleSetSize() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel
          collapsible
          collapsedSize={15}
          minSize={30}
          maxSize={30}
          className="center"
        >
          <Text>
            Left <br />
            {"{10%, 30%}"}
          </Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function CollapsibleTo0() {
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
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel
          collapsible
          collapsedSize={0}
          minSize={10}
          maxSize={30}
          onExpand={() => setExpanded(true)}
          onCollapse={() => setExpanded(false)}
          ref={ref}
          id="left"
          className="center"
        />
        <SplitHandle onDoubleClick={toggle} />
        <SplitPanel>
          <Button
            id="right"
            appearance="solid"
            sentiment="neutral"
            onClick={toggle}
            aria-label="toggle left split panel"
            aria-controls="left"
            style={{ margin: "8px" }}
          >
            {expanded ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
          </Button>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
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
        <Button onClick={handleResizeLeft(10)}>10 | 90</Button>
        <Button onClick={handleResizeLeft(25)}>25 | 75</Button>
        <Button onClick={handleResizeLeft(50)}>50 | 50</Button>
        <Button onClick={handleResizeLeft(75)}>75 | 25</Button>
        <Button onClick={handleResizeLeft(90)}>90 | 10</Button>
      </StackLayout>
      <StackLayout>
        <FlexLayout className="box">
          <Splitter orientation="vertical" appearance="bordered">
            <SplitPanel ref={ref} className="center">
              <Text>Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Right</Text>
            </SplitPanel>
          </Splitter>
        </FlexLayout>
      </StackLayout>
    </FlexLayout>
  );
}
