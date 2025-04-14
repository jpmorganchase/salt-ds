import { Button, FlexLayout } from "@salt-ds/core";
import { DoubleChevronLeftIcon, DoubleChevronRightIcon } from "@salt-ds/icons";
import {
  type ImperativePanelHandle,
  SplitHandle,
  SplitPanel,
  Splitter,
} from "@salt-ds/lab";
import { useRef, useState } from "react";

import styles from "./splitter.module.css";

export function CollapsibleTo0() {
  const ref = useRef<ImperativePanelHandle>(null);
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
    <FlexLayout className={styles.box}>
      <Splitter orientation="vertical">
        <SplitPanel
          collapsible
          collapsedSize={0}
          minSize={10}
          maxSize={30}
          onExpand={() => setExpanded(true)}
          onCollapse={() => setExpanded(false)}
          ref={ref}
          className={styles.center}
        />
        <SplitHandle onDoubleClick={toggle} />
        <SplitPanel>
          <Button
            aria-label="Toggle Split Panel"
            appearance="solid"
            sentiment="neutral"
            onClick={toggle}
            style={{ margin: "8px" }}
          >
            {expanded ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
          </Button>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}
