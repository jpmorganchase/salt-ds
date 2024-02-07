import { ReactElement, useState } from "react";
import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { ParentChildLayout, StackedViewElement } from "@salt-ds/lab";

import styles from "./Default.module.css";
import clsx from "clsx";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const ReducedMotion = (): ReactElement => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <StackLayout align="center">
      <div>
        <p>In order to test this on MacOS, follow these steps: </p>
        <p>
          Go to System Preferences, select the Accessibility category, select
          the Display tab, and enable the Reduce Motion option.
        </p>
      </div>
      <ParentChildLayout
        collapsedViewElement={currentView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={clsx(
          styles["parent-child-layout"],
          styles["reduced-motion"]
        )}
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
