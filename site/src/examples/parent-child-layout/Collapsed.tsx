import { ReactElement, useState } from "react";
import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { ParentChildLayout } from "@salt-ds/lab";

import styles from "./Default.module.css";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const Collapsed = (): ReactElement => {
  const [collapsedView, setCollapsedView] = useState<"child" | "parent">(
    "parent"
  );

  return (
    <StackLayout align="center">
      <ParentChildLayout
        collapsedView={collapsedView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={styles["parent-child-layout"]}
      />
      <ToggleButtonGroup defaultValue="parent">
        <ToggleButton value="parent" onClick={() => setCollapsedView("parent")}>
          Parent
        </ToggleButton>
        <ToggleButton value="child" onClick={() => setCollapsedView("child")}>
          Child
        </ToggleButton>
      </ToggleButtonGroup>
    </StackLayout>
  );
};
