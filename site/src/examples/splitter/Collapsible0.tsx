import { FlexLayout, Text } from "@salt-ds/core";
import { Split, SplitHandle, Splitter } from "@salt-ds/lab";
import type { CSSProperties } from "react";

const center = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  background: "#FFF",
  textAlign: "center",
} as CSSProperties;

const box = {
  width: 420,
  height: 240,
  border: "1px solid lightgrey",
};

export function Collapsible0() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal" appearance="bordered">
        <Split collapsible collapsedSize={0} minSize={30} style={center}>
          <Text>Left</Text>
        </Split>
        <SplitHandle />
        <Split collapsible collapsedSize={0} minSize={30} style={center}>
          <Text>Right</Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
