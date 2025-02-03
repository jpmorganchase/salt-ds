import { Button } from "@salt-ds/core";
import { DoubleChevronLeftIcon, DoubleChevronRightIcon } from "@salt-ds/icons";
import {
  Splitter,
  Split,
  SplitHandle,
  type ImperativeSplitHandle,
} from "@salt-ds/lab";
import { type CSSProperties, useRef, useState } from "react";

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

export function CollapseButton() {
  const ref = useRef<ImperativeSplitHandle>(null);
  const [expanded, setExpanded] = useState(true);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isExpanded } = ref.current;

    if (isExpanded()) {
      collapse();
      setExpanded(false);
    } else {
      expand();
      setExpanded(true);
    }
  }

  return (
    <Splitter orientation="horizontal" style={box}>
      <Split
        collapsible
        collapsedSize={15}
        minSize={30}
        maxSize={30}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
        ref={ref}
        style={center}
      >
        <Button appearance="solid" sentiment="neutral" onClick={toggle}>
          {expanded ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
        </Button>
      </Split>
      <SplitHandle />
      <Split style={center}>Content</Split>
    </Splitter>
  );
}
