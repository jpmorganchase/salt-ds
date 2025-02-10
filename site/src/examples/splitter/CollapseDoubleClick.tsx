import { FlexLayout, Text } from "@salt-ds/core";
import { ArrowLeftIcon, ArrowRightIcon } from "@salt-ds/icons";
import {
  type ImperativeSplitHandle,
  Split,
  SplitHandle,
  Splitter,
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

export function CollapseDoubleClick() {
  const ref = useRef<ImperativeSplitHandle>(null);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isExpanded } = ref.current;

    if (isExpanded()) {
      return collapse();
    }

    return expand();
  }

  return (
    <FlexLayout
      style={{
        width: 640,
        height: 240,
        border: "1px solid lightgrey",
      }}
    >
      <Splitter orientation="horizontal" appearance="bordered">
        <Split
          ref={ref}
          collapsible
          collapsedSize={0}
          minSize={30}
          style={center}
        >
          <Text style={center}>
            Double Click the handle <ArrowRightIcon />
          </Text>
        </Split>
        <SplitHandle onDoubleClick={toggle} />
        <Split style={center}>
          <Text style={center}>
            <ArrowLeftIcon /> Double Click the handle
          </Text>
        </Split>
      </Splitter>
    </FlexLayout>
  );
}
