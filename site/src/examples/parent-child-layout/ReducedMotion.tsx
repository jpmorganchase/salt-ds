import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import { ParentChildLayout, StackedViewElement } from "@salt-ds/lab";

import styles from "./Default.module.css";

const parent = (
  <div className={styles.parentContent} style={{ height: 300 }}>
    Parent
  </div>
);

const child = (
  <div className={styles.childContent} style={{ height: 300 }}>
    Child
  </div>
);

export const ReducedMotion = (): ReactElement => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <>
      <p>In order to test this on MacOS, follow these steps: </p>
      <ul>
        <li>Go to System Preferences</li>
        <li>Select the Accessibility category</li>
        <li>Select the Display tab</li>
        <li>Enable the Reduce Motion option</li>
      </ul>
      <Button onClick={handleParent} disabled={currentView === "parent"}>
        Show parent
      </Button>
      <Button onClick={handleChild} disabled={currentView === "child"}>
        Show child
      </Button>
      <div style={{ width: "40vw", maxWidth: 400 }}>
        <ParentChildLayout
          className="reduced-motion"
          collapsedViewElement={currentView}
          collapseAtBreakpoint="xl"
          parent={parent}
          child={child}
        />
      </div>
    </>
  );
};
