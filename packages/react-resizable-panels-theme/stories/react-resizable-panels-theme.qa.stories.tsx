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

export function Horizontal() {
  return (
    <QAContainer>
      <StackLayout className={"react-resizable-panels-theme-salt"}>
        <PanelGroup direction="horizontal" style={box}>
          <Panel>
            <Text>Panel 1</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
          <Panel>
            <Text>Panel 2</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-left resize-handle-border-right" />
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
          <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
          <Panel>
            <Text>Panel 2</Text>
          </Panel>
          <PanelResizeHandle className="resize-handle-border-top resize-handle-border-bottom" />
          <Panel>
            <Text>Panel 3</Text>
          </Panel>
        </PanelGroup>
      </FlexLayout>
    </QAContainer>
  );
}
