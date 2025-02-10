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

export function Vertical() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="vertical" appearance="bordered">
        <Split style={center}>
          <Text>Top</Text>
        </Split>
        <SplitHandle />
        <Split style={center}>
          <Text>Middle</Text>
        </Split>
        <SplitHandle />
        <Split style={center}>
          <Text>Bottom</Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
