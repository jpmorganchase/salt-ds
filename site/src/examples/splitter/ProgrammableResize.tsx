import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import {
  Splitter,
  Split,
  SplitHandle,
  type ImperativeSplitHandle,
} from "@salt-ds/lab";
import { type CSSProperties, useRef } from "react";

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

export function ProgrammableResize() {
  const ref = useRef<ImperativeSplitHandle>(null);

  function handleResizeLeft(size: number) {
    return () => {
      ref.current?.resize(size);
    };
  }

  return (
    <FlexLayout align="center">
      <StackLayout gap={2}>
        <Button onClick={handleResizeLeft(0)}>0 | 100</Button>
        <Button onClick={handleResizeLeft(25)}>25 | 75</Button>
        <Button onClick={handleResizeLeft(50)}>50 | 50</Button>
        <Button onClick={handleResizeLeft(75)}>75 | 25</Button>
        <Button onClick={handleResizeLeft(100)}>100 | 0</Button>
      </StackLayout>
      <StackLayout style={box}>
        <Splitter orientation="horizontal" appearance="bordered">
          <Split ref={ref} style={center}>
            <Text>Left</Text>
          </Split>
          <SplitHandle />
          <Split style={center}>
            <Text>Right</Text>
          </Split>
        </Splitter>
      </StackLayout>
    </FlexLayout>
  );
}
