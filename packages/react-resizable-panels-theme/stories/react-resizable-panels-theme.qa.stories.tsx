import { Text } from "@salt-ds/core";
import "@salt-ds/react-resizable-panels-theme/index.css";
import { QAContainer } from "docs/components";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
  PanelGroup as PanelGroupV3,
  PanelResizeHandle as PanelResizeHandleV3,
  Panel as PanelV3,
} from "react-resizable-panels-v3";

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

const zeroSizedPanels = ["first", "middle", "last"] as const;

function ZeroSizedPanelGroupV3({
  direction,
  zeroSizedPanel,
}: {
  direction: "horizontal" | "vertical";
  zeroSizedPanel: (typeof zeroSizedPanels)[number];
}) {
  const handleClassName =
    direction === "horizontal"
      ? "resize-handle-salt-border-left resize-handle-salt-border-right"
      : "resize-handle-salt-border-top resize-handle-salt-border-bottom";

  const renderPanel = (panel: (typeof zeroSizedPanels)[number]) =>
    panel === zeroSizedPanel ? (
      <PanelV3 defaultSize={0} minSize={0} />
    ) : (
      <PanelV3 defaultSize={50} minSize={0}>
        <Text>Panel</Text>
      </PanelV3>
    );

  return (
    <PanelGroupV3
      direction={direction}
      style={{
        width: 240,
        height: 120,
        boxSizing: "border-box",
        border: "1px solid var(--salt-separable-secondary-borderColor)",
      }}
    >
      {renderPanel("first")}
      <PanelResizeHandleV3 className={handleClassName} />
      {renderPanel("middle")}
      <PanelResizeHandleV3 className={handleClassName} />
      {renderPanel("last")}
    </PanelGroupV3>
  );
}

// v3 keeps zero-sized panels in the DOM, so the theme overlaps the borders
// that would otherwise double up next to them.
export function ZeroSizedPanelsV3() {
  return (
    <QAContainer className="react-resizable-panels-theme-salt">
      {(["horizontal", "vertical"] as const).flatMap((direction) =>
        zeroSizedPanels.map((zeroSizedPanel) => (
          <ZeroSizedPanelGroupV3
            key={`${direction}-${zeroSizedPanel}`}
            direction={direction}
            zeroSizedPanel={zeroSizedPanel}
          />
        )),
      )}
    </QAContainer>
  );
}

ZeroSizedPanelsV3.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
