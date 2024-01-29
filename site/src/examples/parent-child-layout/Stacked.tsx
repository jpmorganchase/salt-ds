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

export const Stacked = (): ReactElement => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <>
      <Button onClick={handleParent} disabled={currentView === "parent"}>
        Show parent
      </Button>
      <Button onClick={handleChild} disabled={currentView === "child"}>
        Show child
      </Button>
      <div style={{ width: "40vw", maxWidth: 400 }}>
        <ParentChildLayout
          collapsedViewElement={currentView}
          collapseAtBreakpoint="xl"
          parent={parent}
          child={child}
        />
      </div>
    </>
  );
};
