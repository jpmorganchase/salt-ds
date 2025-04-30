import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import "ag-grid-community/styles/ag-grid.css";
import "../salt-react-resizable-panels-theme.css";
import "./splitter.stories.css";
import {
  Button,
  FlexLayout,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { useRef, useState } from "react";
import {
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  EditIcon,
  InboxIcon,
  SendIcon,
} from "@salt-ds/icons";

export default {
  title: "React Resizable Panels/Theme",
  component: Panel,
  parameters: {
    // Make all ag grid examples go through chromatic
    chromatic: {
      disableSnapshot: false,
      delay: 200,
      // double default width from `useAgGridHelpers` given we're using side-by-side mode, + panel wrapper padding
      modes: {
        dual: { mode: "side-by-side", viewport: { width: 800 * 2 + 24 * 4 } },
      },
    },
  },
};

export function Horizontal() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel id="top" className="center" minSize={10}>
          <Text>Top</Text>
        </Panel>
        <PanelResizeHandle
          aria-label="Resize Top/Middle"
          className="borderLeftRight"
        />
        <Panel id="middle" className="center" minSize={10}>
          <Text>Middle</Text>
        </Panel>
        <PanelResizeHandle
          aria-label="Resize Middle/Bottom"
          className="borderLeftRight"
        />
        <Panel id="bottom" className="center" minSize={10}>
          <Text>Bottom</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function Vertical() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="vertical">
        <Panel id="left" className="center">
          <Text>Left</Text>
        </Panel>
        <PanelResizeHandle
          aria-label="Resize Left/Center"
          className="borderTopBottom"
        />
        <Panel id="center" className="center">
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle
          aria-label="Resize Center/Right"
          className="borderTopBottom"
        />
        <Panel id="right" className="center">
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function MultiOrientational() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="center">
              <Text>Top Left</Text>
            </Panel>
            <PanelResizeHandle className="borderTopBottom" />
            <Panel className="center">
              <Text>Middle Left</Text>
            </Panel>
            <PanelResizeHandle className="borderTopBottom" />
            <Panel className="center">
              <Text>Bottom Left</Text>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="borderLeftRight" />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="center">
              <Text>Top Right</Text>
            </Panel>
            <PanelResizeHandle className="borderTopBottom" />
            <Panel className="center">
              <Text>Bottom Right</Text>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function Transparent() {
  return (
    <FlexLayout className="box boxGrey">
      <PanelGroup direction="horizontal">
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="center">
              <Text>Top Left</Text>
            </Panel>
            <PanelResizeHandle className="saltResizeHandleTransparent" />
            <Panel className="center">
              <Text>Middle Left</Text>
            </Panel>
            <PanelResizeHandle />
            <Panel className="center">
              <Text>Bottom Left</Text>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="saltResizeHandleTransparent" />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="center">
              <Text>Top Right</Text>
            </Panel>
            <PanelResizeHandle className="saltResizeHandleTransparent" />
            <Panel className="center">
              <Text>Bottom Right</Text>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function Border() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel id="left" minSize={0} defaultSize={25} className="center">
          <Text>Left</Text>
        </Panel>
        <PanelResizeHandle className="borderRight" />
        <Panel minSize={50} className="center">
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle className="borderLeft" />
        <Panel minSize={0} defaultSize={25} className="center">
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function Variant() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel minSize={0} defaultSize={25} className="center panelSecondary">
          <Text>Left</Text>
        </Panel>
        <PanelResizeHandle className="borderRight saltResizeHandleSecondary" />
        <Panel minSize={50} className="center">
          <Text>Center</Text>
        </Panel>
        <PanelResizeHandle className="borderLeft saltResizeHandleTertiary" />
        <Panel minSize={0} defaultSize={25} className="center panelTertiary">
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function Size() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel minSize={20} className="center">
          <Text>Left [20%, X]</Text>
        </Panel>
        <PanelResizeHandle className="borderTopBottom" />
        <Panel id="middle" minSize={40} maxSize={60} className="center">
          <Text>Middle [30%, 60%]</Text>
        </Panel>
        <PanelResizeHandle className="borderTopBottom" />
        <Panel minSize={20} className="center">
          <Text>Right [20%, X]</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function CollapsibleSetSize() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel
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
        </Panel>
        <PanelResizeHandle className="borderTopBottom" />
        <Panel className="center">
          <Text>Right</Text>
        </Panel>
      </PanelGroup>
    </FlexLayout>
  );
}

export function CollapsibleContainerQuery() {
  return (
    <FlexLayout className="box">
      <PanelGroup direction="horizontal">
        <Panel
          collapsible
          collapsedSize={10}
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className="sidePanel"
        >
          <ToggleButtonGroup orientation="vertical" defaultValue="inbox">
            <ToggleButton value="inbox">
              <InboxIcon aria-label="Inbox" />
              <span aria-hidden>Inbox</span>
            </ToggleButton>
            <ToggleButton value="draft">
              <EditIcon aria-label="Draft" />
              <span aria-hidden>Draft</span>
            </ToggleButton>
            <ToggleButton value="sent">
              <SendIcon aria-label="Sent" />
              <span aria-hidden>Sent</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </Panel>
        <PanelResizeHandle className="borderTopBottom" />
        <Panel className="center">
          <Text>Content</Text>
        </Panel>
      </PanelGroup>
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
      <PanelGroup direction="horizontal">
        <Panel
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
        <PanelResizeHandle onDoubleClick={toggle} className="borderTopBottom" />
        <Panel>
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
        </Panel>
      </PanelGroup>
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
          <PanelGroup direction="horizontal">
            <Panel ref={ref} className="center">
              <Text>Left</Text>
            </Panel>
            <PanelResizeHandle className="borderTopBottom" />
            <Panel className="center">
              <Text>Right</Text>
            </Panel>
          </PanelGroup>
        </FlexLayout>
      </StackLayout>
    </FlexLayout>
  );
}
