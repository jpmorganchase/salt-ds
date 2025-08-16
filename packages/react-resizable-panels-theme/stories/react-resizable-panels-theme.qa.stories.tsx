import { Text } from "@salt-ds/core";
import { QAContainer } from "docs/components";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import "../index.css";

export default {
  title: "React Resizable Panels/Theme/React Resizable Panels Theme QA",
  component: PanelGroup,
  subcomponents: { Panel, PanelResizeHandle },
};

export function Variants() {
  return (
    <QAContainer className="react-resizable-panels-theme-salt">
      <PanelGroup
        direction="horizontal"
        style={{
          width: 240,
          height: 120,
          boxSizing: "border-box",
          border: "1px solid lightgrey",
        }}
      >
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
      <PanelGroup
        direction="vertical"
        style={{
          width: 240,
          height: 120,
          boxSizing: "border-box",
          border: "1px solid lightgrey",
        }}
      >
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

      <PanelGroup
        direction="horizontal"
        style={{
          width: 480,
          height: 120,
          boxSizing: "border-box",
          border: "1px solid lightgrey",
          // Background color to test transparent panels
          backgroundColor: "var(--salt-accent-background)",
        }}
      >
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
    </QAContainer>
  );
}

Variants.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
