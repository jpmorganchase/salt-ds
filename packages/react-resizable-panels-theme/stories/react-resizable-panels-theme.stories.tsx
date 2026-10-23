import {
  Group,
  Panel,
  type PanelImperativeHandle,
  Separator,
} from "react-resizable-panels";

import "@salt-ds/react-resizable-panels-theme/index.css";
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
        <Group orientation="horizontal">
          <Panel id="left" className="center" minSize="10%">
            <Text>Left</Text>
          </Panel>
          <Separator
            aria-label="Resize Left/Center"
            className="resize-handle-salt-border-left resize-handle-salt-border-right"
          />
          <Panel id="middle" className="center" minSize="10%">
            <Text>Center</Text>
          </Panel>
          <Separator
            aria-label="Resize Center/Right"
            className="resize-handle-salt-border-left resize-handle-salt-border-right"
          />
          <Panel id="right" className="center" minSize="10%">
            <Text>Right</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="vertical">
          <Panel id="top" className="center">
            <Text>Top</Text>
          </Panel>
          <Separator
            aria-label="Resize Top/Middle"
            className="resize-handle-salt-border-top resize-handle-salt-border-bottom"
          />
          <Panel id="middle" className="center">
            <Text>Middle</Text>
          </Panel>
          <Separator
            aria-label="Resize Middle/Bottom"
            className="resize-handle-salt-border-top resize-handle-salt-border-bottom"
          />
          <Panel id="bottom" className="center">
            <Text>Bottom</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function MultiOrientational() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel>
            <Group orientation="vertical">
              <Panel className="center">
                <Text>Top Left</Text>
              </Panel>
              <Separator className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
              <Panel className="center">
                <Text>Middle Left</Text>
              </Panel>
              <Separator className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
              <Panel className="center">
                <Text>Bottom Left</Text>
              </Panel>
            </Group>
          </Panel>
          <Separator className="resize-handle-salt-border-right resize-handle-salt-border-left" />
          <Panel>
            <Group orientation="vertical">
              <Panel className="center">
                <Text>Top Right</Text>
              </Panel>
              <Separator className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
              <Panel className="center">
                <Text>Bottom Right</Text>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function Transparent() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box boxGrey">
        <Group orientation="horizontal">
          <Panel>
            <Group orientation="vertical">
              <Panel className="center">
                <Text>Top Left</Text>
              </Panel>
              <Separator />
              <Panel className="center">
                <Text>Middle Left</Text>
              </Panel>
              <Separator />
              <Panel className="center">
                <Text>Bottom Left</Text>
              </Panel>
            </Group>
          </Panel>
          <Separator />
          <Panel>
            <Group orientation="vertical">
              <Panel className="center">
                <Text>Top Right</Text>
              </Panel>
              <Separator />
              <Panel className="center">
                <Text>Bottom Right</Text>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function Border() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel id="left" minSize="0%" defaultSize="25%" className="center">
            <Text>Left</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-right" />
          <Panel minSize="50%" className="center">
            <Text>Center</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left" />
          <Panel minSize="0%" defaultSize="25%" className="center">
            <Text>Right</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function Variant() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel
            minSize="0%"
            defaultSize="25%"
            className="center resizable-panel-salt-variant-secondary"
          >
            <Text>Left</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-right resize-handle-salt-variant-secondary" />
          <Panel minSize="50%" className="center">
            <Text>Center</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left resize-handle-salt-variant-tertiary" />
          <Panel
            minSize="0%"
            defaultSize="25%"
            className="center resizable-panel-salt-variant-tertiary"
          >
            <Text>Right</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function Size() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel minSize="20%" className="center">
            <Text>Left [20%, X]</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel id="middle" minSize="40%" maxSize="60%" className="center">
            <Text>Middle [30%, 60%]</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel minSize="20%" className="center">
            <Text>Right [20%, X]</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function CollapsibleSetSize() {
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel
            collapsible
            collapsedSize="15%"
            minSize="30%"
            maxSize="30%"
            className="center"
          >
            <Text>Left [15%, 30%]</Text>
          </Panel>
          <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel className="center">
            <Text>Right</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function CollapsibleContainerQuery() {
  // Chrome 105+ required for container query support
  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel
            collapsible
            collapsedSize="10%"
            defaultSize="30%"
            minSize="20%"
            maxSize="50%"
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
          <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel className="center">
            <Text>Content</Text>
          </Panel>
        </Group>
      </FlexLayout>
    </div>
  );
}

export function CollapsibleTo0() {
  const ref = useRef<PanelImperativeHandle>(null);
  const [expanded, setExpanded] = useState(true);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isCollapsed } = ref.current;

    if (isCollapsed()) {
      expand();
    } else {
      collapse();
    }
  }

  return (
    <div className="react-resizable-panels-theme-salt">
      <FlexLayout className="box">
        <Group orientation="horizontal">
          <Panel
            collapsible
            collapsedSize="0%"
            minSize="10%"
            maxSize="30%"
            onResize={(size) => setExpanded(size.asPercentage > 0)}
            panelRef={ref}
            id="left"
            className="center"
          />
          <Separator
            disableDoubleClick
            onDoubleClick={toggle}
            className="resize-handle-salt-border-left resize-handle-salt-border-right"
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
        </Group>
      </FlexLayout>
    </div>
  );
}

export function ProgrammableResize() {
  const ref = useRef<PanelImperativeHandle>(null);

  function handleResizeLeft(size: number) {
    return () => {
      ref.current?.resize(`${size}%`);
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
            <Group orientation="horizontal">
              <Panel panelRef={ref} className="center">
                <Text>Left</Text>
              </Panel>
              <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
              <Panel className="center">
                <Text>Right</Text>
              </Panel>
            </Group>
          </FlexLayout>
        </StackLayout>
      </FlexLayout>
    </div>
  );
}
