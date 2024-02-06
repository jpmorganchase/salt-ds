import { ReactElement, useState } from "react";
import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { ParentChildLayout, StackedViewElement } from "@salt-ds/lab";

import styles from "./Default.module.css";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const Collapsed = (): ReactElement => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <StackLayout align="center">
      <ParentChildLayout
        collapsedViewElement={currentView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={styles["parent-child-layout"]}
      />
      <ToggleButtonGroup defaultValue="parent">
        <ToggleButton value="parent" onClick={handleParent}>
          Parent
        </ToggleButton>
        <ToggleButton value="child" onClick={handleChild}>
          Child
        </ToggleButton>
      </ToggleButtonGroup>
    </StackLayout>
  );
};
