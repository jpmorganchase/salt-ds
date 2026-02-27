import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import treeNodeLabelCss from "./TreeNodeLabel.css";

export interface TreeNodeLabelProps extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltTreeNodeLabel");

export const TreeNodeLabel = forwardRef<HTMLSpanElement, TreeNodeLabelProps>(
  function TreeNodeLabel(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree-node-label",
      css: treeNodeLabelCss,
      window: targetWindow,
    });

    return (
      <span ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {children}
      </span>
    );
  },
);
