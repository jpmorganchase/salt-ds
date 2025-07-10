import {
  Label,
  ParentChildLayout,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ReactElement, useState } from "react";
import styles from "./Default.module.css";

const parent = <div className={styles.parentContent}>Parent</div>;

const child = <div className={styles.childContent}>Child</div>;

export const ReducedMotion = (): ReactElement => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
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
        visibleView={visibleView}
        collapseAtBreakpoint="xl"
        parent={parent}
        child={child}
        className={clsx(
          styles["parent-child-layout"],
          styles["reduced-motion"],
        )}
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
