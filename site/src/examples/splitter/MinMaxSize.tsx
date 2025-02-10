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

export function MinMaxSize() {
  return (
    <FlexLayout style={box}>
      <Splitter orientation="horizontal" appearance="bordered">
        <Split minSize={20} style={center}>
          <Text>Left [20%, X]</Text>
        </Split>
        <SplitHandle />
        <Split minSize={40} maxSize={60} style={center}>
          <Text>Middle [30%, 60%]</Text>
        </Split>
        <SplitHandle />
        <Split minSize={20} style={center}>
          <Text>Right [20%, X]</Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
