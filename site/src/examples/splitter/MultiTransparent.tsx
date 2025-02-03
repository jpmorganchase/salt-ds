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

export function MultiTransparent() {
  return (
    <FlexLayout
      style={{
        ...box,
        padding: "56px",
        background: "lightpink",
        boxSizing: "content-box",
      }}
    >
      <Splitter orientation="horizontal" appearance="transparent">
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Left</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Middle Left</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Left</Text>
            </Split>
          </Splitter>
        </Split>
        <SplitHandle />
        <Split>
          <Splitter orientation="vertical">
            <Split style={center}>
              <Text>Top Right</Text>
            </Split>
            <SplitHandle />
            <Split style={center}>
              <Text>Bottom Right</Text>
            </Split>
          </Splitter>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
