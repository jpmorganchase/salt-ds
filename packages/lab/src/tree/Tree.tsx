import { useContext, type ReactNode } from "react";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { DepthContext } from "../stepped-tracker/SteppedTracker.Provider";
import { TreeProvider } from "./Tree.Provider";

import treeCSS from "./Tree.css";
import type { TreeNode } from "./TreeNode";

export namespace Tree {
  export interface Props {
    parent?: TreeNode.Record;
    children?: ReactNode;
  }
}

const withBaseName = makePrefixer("saltTree");

export function Tree({ parent, children }: Tree.Props) {
  const targetWindow = useWindow();
  const depth = useContext(DepthContext);

  const role = depth === 0 ? "tree" : "group";

  useComponentCssInjection({
    testId: "salt-tree",
    window: targetWindow,
    css: treeCSS,
  });

  return (
    <TreeProvider parent={parent}>
      <ul role={role} className={withBaseName()}>
        {children}
      </ul>
    </TreeProvider>
  );
}
