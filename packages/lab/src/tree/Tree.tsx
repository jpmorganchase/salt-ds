import clsx from "clsx";
import { makePrefixer } from "packages/core/src";
import { useComponentCssInjection } from "packages/styles/src";
import { useWindow } from "packages/window/src";
import { type ComponentPropsWithRef, forwardRef, useMemo } from "react";
import treeCss from "./Tree.css";
import { TreeProvider } from "./TreeContext";
import { useTree } from "./useTree";

interface TreeProps extends ComponentPropsWithRef<"ul"> {
  expanded?: string[];
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltTree");

export const Tree = forwardRef<HTMLUListElement, TreeProps>(
  function Tree(props, ref) {
    const { children, className, expanded, disabled, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree",
      css: treeCss,
      window: targetWindow,
    });

    const treeState = useTree();

    const contextValue = useMemo(
      () => ({
        ...treeState,
      }),
      [treeState],
    );

    return (
      <TreeProvider value={contextValue}>
        <ul
          role="tree"
          className={clsx(
            withBaseName(),
            {
              [withBaseName("disabled")]: disabled,
            },
            className,
          )}
          {...rest}
        >
          {children}
        </ul>
      </TreeProvider>
    );
  },
);
