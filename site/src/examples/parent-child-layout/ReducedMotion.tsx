import { ReactElement, useState } from "react";
import {
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  Label,
} from "@salt-ds/core";
import { ParentChildLayout } from "@salt-ds/lab";

import styles from "./Default.module.css";
import clsx from "clsx";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const ReducedMotion = (): ReactElement => {
  const [collapsedView, setCollapsedView] = useState<"child" | "parent">(
    "parent"
  );
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
        collapsedView={collapsedView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={clsx(
          styles["parent-child-layout"],
          styles["reduced-motion"]
        )}
      />
      <StackLayout align="center" gap={1}>
        <Label>Collapsed View: </Label>

        <ToggleButtonGroup defaultValue="parent">
          <ToggleButton
            value="parent"
            onClick={() => setCollapsedView("parent")}
          >
            Parent
          </ToggleButton>
          <ToggleButton value="child" onClick={() => setCollapsedView("child")}>
            Child
          </ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};
