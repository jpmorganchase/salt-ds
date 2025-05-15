import { FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { QAContainer } from "docs/components";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import "../index.css";

export default {
  title: "React Resizable Panels/Theme/React Resizable Panels Theme QA",
  component: PanelGroup,
  subcomponents: { Panel, PanelResizeHandle },
};

const box = {
  width: 80,
  height: 120,
  border: "1px solid lightgrey",
};

const altBox = {
  width: 240,
  height: 80,
  border: "1px solid lightgrey",
};

const variantBox = {
  width: 480,
  height: 120,
  border: "1px solid lightgrey",
};

export function Horizontal() {
  return (
    <QAContainer>
      <StackLayout className={"react-resizable-panels-theme-salt"}>
        <PanelGroup direction="horizontal" style={box}>
          <Panel>
            <Text>Panel 1</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel>
            <Text>Panel 2</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-left resize-handle-salt-border-right" />
          <Panel>
            <Text>Panel 3</Text>
          </Panel>
        </PanelGroup>
      </StackLayout>
    </QAContainer>
  );
}

export function Vertical() {
  return (
    <QAContainer>
      <FlexLayout style={altBox} className="react-resizable-panels-theme-salt">
        <PanelGroup direction="vertical">
          <Panel>
            <Text>Panel 1</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
          <Panel>
            <Text>Panel 2</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
          <Panel>
            <Text>Panel 3</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </QAContainer>
  );
}

export function Variant() {
  return (
    <QAContainer>
      <FlexLayout className="react-resizable-panels-theme-salt">
        <PanelGroup direction="horizontal" style={variantBox}>
          <Panel className="resizable-panel-salt-variant-primary">
            <Text>Primary</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-right resize-handle-salt-variant-primary" />
          <Panel className="resizable-panel-salt-variant-secondary">
            <Text>Secondary</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-right resize-handle-salt-variant-secondary" />
          <Panel className="resizable-panel-salt-variant-tertiary">
            <Text>Tertiary</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-salt-border-right resize-handle-salt-variant-tertiary" />
          <Panel>
            <Text>Transparent</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </QAContainer>
  );
}
