import clsx from "clsx";
import { makePrefixer, useIcon } from "packages/core/src";
import { useComponentCssInjection } from "packages/styles/src";
import { useWindow } from "packages/window/src";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  TreeNodeProvider,
  useTreeContext,
  useTreeNodeContext,
} from "./TreeContext";
import treeNodeCss from "./TreeNode.css";

interface TreeNodeProps extends ComponentPropsWithoutRef<"li"> {
  disabled?: boolean;
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

interface TreeNodeInternalProps {
  _posinset?: number;
  _setsize?: number;
}

const withBaseName = makePrefixer("saltTreeNode");

export const TreeNode = forwardRef<
  HTMLLIElement,
  TreeNodeProps & TreeNodeInternalProps
>(function TreeNode(props, ref) {
  const { value, label, disabled, children, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree-node",
    css: treeNodeCss,
    window: targetWindow,
  });

  const nodeRef = useRef<HTMLLIElement>(null);
  const hasChildren = children != null;

  const expanded = true;

  const { registerNode } = useTreeContext();

  const parentContext = useTreeNodeContext();
  const level = (parentContext?.level ?? 0) + 1;

  useEffect(() => {
    if (nodeRef.current) {
      return registerNode(value, nodeRef.current, undefined, undefined);
    }
  }, []);

  const nodeContext = useMemo(
    () => ({
      value,
      level,
      hasChildren,
      expanded,
      disabled,
    }),
    [value, level, hasChildren, expanded, disabled],
  );

  return (
    <TreeNodeProvider value={nodeContext}>
      <li
        ref={nodeRef}
        role="treeitem"
        className={clsx(withBaseName(), {
          [withBaseName("disabled")]: disabled,
        })}
        {...rest}
        style={{ "--saltTreeNode-level": level } as CSSProperties}
      >
        <div className={withBaseName("content")}>
          <span>{hasChildren && <ExpansionIcon expanded={expanded} />}</span>
          <span className={withBaseName("label")}>{label}</span>
        </div>

        {hasChildren && expanded && (
          <ul role="group" className={withBaseName("group")}>
            {children}
          </ul>
        )}
      </li>
    </TreeNodeProvider>
  );
});

function ExpansionIcon({ expanded }: { expanded: boolean }) {
  const { ExpandGroupIcon, CollapseGroupIcon } = useIcon();
  const Icon = expanded ? CollapseGroupIcon : ExpandGroupIcon;
  return <Icon aria-hidden className="saltTreeNode-expansionIcon" />;
}
