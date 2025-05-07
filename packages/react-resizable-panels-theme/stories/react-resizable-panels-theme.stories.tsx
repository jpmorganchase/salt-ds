import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import "../index.css";
import "./splitter.stories.css";

import {
  Button,
  FlexLayout,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import {
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  EditIcon,
  InboxIcon,
  SendIcon,
} from "@salt-ds/icons";
import { useRef, useState } from "react";

export default {
  title: "React Resizable Panels/Theme",
  component: Panel,
};

export function Horizontal() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="horizontal">
          <Panel id="left" className="center" minSize={10}>
            <Text>Left</Text>
          </Panel>
          <PanelResizeHandle
            aria-label="Resize Left/Center"
            className="resize-handle-border-left resize-handle-border-right"
          />
          <Panel id="middle" className="center" minSize={10}>
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle
            aria-label="Resize Center/Right"
            className="resize-handle-border-left resize-handle-border-right"
          />
          <Panel id="right" className="center" minSize={10}>
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="vertical">
          <Panel id="top" className="center">
            <Text>Top</Text>
          </Panel>
          <PanelResizeHandle
            aria-label="Resize Top/Middle"
            className="resize-handle-border-top resize-handle-border-bottom"
          />
          <Panel id="middle" className="center">
            <Text>Middle</Text>
          </Panel>
          <PanelResizeHandle
            aria-label="Resize Middle/Bottom"
            className="resize-handle-border-top resize-handle-border-bottom"
          />
          <Panel id="bottom" className="center">
            <Text>Bottom</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function MultiOrientational() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="horizontal">
          <Panel>
            <PanelGroup direction="vertical">
              <Panel className="center">
                <Text>Top Left</Text>
              </Panel>
              <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
              <Panel className="center">
                <Text>Middle Left</Text>
              </Panel>
              <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
              <Panel className="center">
                <Text>Bottom Left</Text>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-right resize-handle-border-left" />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel className="center">
                <Text>Top Right</Text>
              </Panel>
              <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
              <Panel className="center">
                <Text>Bottom Right</Text>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function Transparent() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box boxGrey">
        <PanelGroup direction="horizontal">
          <Panel>
            <PanelGroup direction="vertical">
              <Panel className="center">
                <Text>Top Left</Text>
              </Panel>
              <PanelResizeHandle />
              <Panel className="center">
                <Text>Middle Left</Text>
              </Panel>
              <PanelResizeHandle />
              <Panel className="center">
                <Text>Bottom Left</Text>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel className="center">
                <Text>Top Right</Text>
              </Panel>
              <PanelResizeHandle />
              <Panel className="center">
                <Text>Bottom Right</Text>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function Border() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="horizontal">
          <Panel id="left" minSize={0} defaultSize={25} className="center">
            <Text>Left</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-right" />
          <Panel minSize={50} className="center">
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left" />
          <Panel minSize={0} defaultSize={25} className="center">
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function Variant() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="horizontal">
          <Panel
            minSize={0}
            defaultSize={25}
            className="center resizable-panel-salt-variant-secondary"
          >
            <Text>Left</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-right resize-handle-salt-variant-secondary" />
          <Panel minSize={50} className="center">
            <Text>Center</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left resize-handle-salt-variant-tertiary" />
          <Panel
            minSize={0}
            defaultSize={25}
            className="center resizable-panel-salt-variant-tertiary"
          >
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function Size() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <PanelGroup direction="horizontal">
          <Panel minSize={20} className="center">
            <Text>Left [20%, X]</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
          <Panel id="middle" minSize={40} maxSize={60} className="center">
            <Text>Middle [30%, 60%]</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
          <Panel minSize={20} className="center">
            <Text>Right [20%, X]</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function CollapsibleSetSize() {
  return (
    <div className="react-resizable-panels-theme-salt">
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
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
          <Panel className="center">
            <Text>Right</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
  );
}

export function CollapsibleContainerQuery() {
  return (
    <div className="react-resizable-panels-theme-salt">
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
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
          <Panel className="center">
            <Text>Content</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
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
    <div className="react-resizable-panels-theme-salt">
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
          <PanelResizeHandle
            onDoubleClick={toggle}
            className="resize-handle-border-left resize-handle-border-right"
          />
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
              {expanded ? (
                <DoubleChevronLeftIcon />
              ) : (
                <DoubleChevronRightIcon />
              )}
            </Button>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </div>
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
    <div className="react-resizable-panels-theme-salt">
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
              <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
              <Panel className="center">
                <Text>Right</Text>
              </Panel>
            </PanelGroup>
          </FlexLayout>
        </StackLayout>
      </FlexLayout>
    </div>
  );
}
