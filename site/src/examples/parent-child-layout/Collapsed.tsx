import { ReactElement, useState } from "react";
import {
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  Label,
} from "@salt-ds/core";
import { ParentChildLayout } from "@salt-ds/lab";

import styles from "./Default.module.css";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const Collapsed = (): ReactElement => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
  };

  return (
    <StackLayout align="center">
      <ParentChildLayout
        visibleView={visibleView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={styles["parent-child-layout"]}
      />
      <StackLayout align="center" gap={1}>
        <Label>Visible View: </Label>

        <ToggleButtonGroup defaultValue="child" onChange={handleChange}>
          <ToggleButton value="parent">Parent</ToggleButton>
          <ToggleButton value="child">Child</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};
