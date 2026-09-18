import { Text } from "@salt-ds/core";
import "@salt-ds/react-resizable-panels-theme/index.css";
import { QAContainer } from "docs/components";
import { Group, Panel, Separator } from "react-resizable-panels";

export default {
  title: "React Resizable Panels/Theme/React Resizable Panels Theme QA",
  component: Group,
  subcomponents: { Panel, Separator },
};

export function Variants() {
  return (
    <QAContainer className="react-resizable-panels-theme-salt">
      <Group
        orientation="horizontal"
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
        <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
        <Panel>
          <Text>Panel 2</Text>
        </Panel>
        <Separator className="resize-handle-salt-border-left resize-handle-salt-border-right" />
        <Panel>
          <Text>Panel 3</Text>
        </Panel>
      </Group>
      <Group
        orientation="vertical"
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
        <Separator className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
        <Panel>
          <Text>Panel 2</Text>
        </Panel>
        <Separator className="resize-handle-salt-border-top resize-handle-salt-border-bottom" />
        <Panel>
          <Text>Panel 3</Text>
        </Panel>
      </Group>

      <Group
        orientation="horizontal"
        style={{
          width: 480,
          height: 120,
          boxSizing: "border-box",
          border: "1px solid lightgrey",
          // Background color to test transparent panels
          backgroundColor: "var(--salt-sentiment-accent-background)",
        }}
      >
        <Panel className="resizable-panel-salt-variant-primary">
          <Text>Primary</Text>
        </Panel>
        <Separator className="resize-handle-salt-border-right resize-handle-salt-variant-primary" />
        <Panel className="resizable-panel-salt-variant-secondary">
          <Text>Secondary</Text>
        </Panel>
        <Separator className="resize-handle-salt-border-right resize-handle-salt-variant-secondary" />
        <Panel className="resizable-panel-salt-variant-tertiary">
          <Text>Tertiary</Text>
        </Panel>
        <Separator className="resize-handle-salt-border-right resize-handle-salt-variant-tertiary" />
        <Panel>
          <Text>Transparent</Text>
        </Panel>
      </Group>
    </QAContainer>
  );
}

Variants.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
