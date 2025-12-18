import {
  CheckboxIcon,
  makePrefixer,
  useForkRef,
  useIcon,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
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

function ExpansionIcon({ expanded }: { expanded: boolean }) {
  const { ExpandGroupIcon } = useIcon();
  return (
    <ExpandGroupIcon
      aria-hidden
      className={clsx("saltTreeNode-expansionIcon", {
        "saltTreeNode-expansionIcon-expanded": expanded,
      })}
    />
  );
}

export interface TreeNodeProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * Identifier of the node
   */
  value: string;
  /**
   * Label for the node
   */
  label: ReactNode;
  /**
   * Optional icon to display before the label
   */
  icon?: ReactNode;
  /**
   * Whether the node is disabled.
   * Disabled nodes cannot be selected, expanded, or interacted with.
   * Inherits disabled state from parent nodes and tree-level disabled prop.
   */
  disabled?: boolean;
  /**
   * Child nodes. Nested TreeNodes create a hierarchy.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltTreeNode");

export const TreeNode = forwardRef<HTMLLIElement, TreeNodeProps>(
  function TreeNode(props, ref) {
    const {
      value,
      label,
      icon,
      disabled: disabledProp = false,
      children,
      className,
      id: idProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree-node",
      css: treeNodeCss,
      window: targetWindow,
    });

    const id = useId(idProp);
    const labelId = `${id}-label`;
    const nodeRef = useRef<HTMLLIElement>(null);

    const {
      expandedState,
      toggleExpanded,
      selectedState,
      select,
      multiselect,
      registerElement,
      activeNode,
      setActiveNode,
      disabled: treeDisabled,
      disabledIdsSet,
      indeterminateState,
      getFirstVisibleNode,
      mounted,
    } = useTreeContext();

    const parentContext = useTreeNodeContext();
    const level = (parentContext?.level ?? 0) + 1;

    const disabled = treeDisabled || disabledProp || disabledIdsSet.has(value);
    const hasChildren = children != null;
    const expanded = expandedState.has(value);
    const selected = selectedState.includes(value);
    const indeterminate = indeterminateState.has(value);
    const isActive = activeNode === value;

    const isTabbable =
      !disabled &&
      (isActive ||
        (activeNode === undefined &&
          mounted &&
          getFirstVisibleNode() === value));

    useEffect(() => {
      if (nodeRef.current) {
        return registerElement(value, nodeRef.current);
      }
    }, [value, registerElement]);

    useEffect(() => {
      if (isActive && nodeRef.current) {
        nodeRef.current.focus();
        nodeRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }, [isActive]);

    const handleContentClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        setActiveNode(value);
        select(event, value);
      },
      [disabled, setActiveNode, value, select],
    );

    const handleExpansionClick = useCallback(
      (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation();
        if (disabled) return;
        toggleExpanded(value);
      },
      [disabled, toggleExpanded, value],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLLIElement>) => {
        if (!disabled && event.target === event.currentTarget) {
          setActiveNode(value);
        }
      },
      [disabled, setActiveNode, value],
    );

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

    const handleRef = useForkRef(nodeRef, ref);

    return (
      <TreeNodeProvider value={nodeContext}>
        <li
          ref={handleRef}
          id={id}
          role="treeitem"
          aria-labelledby={labelId}
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={multiselect ? undefined : selected}
          aria-checked={
            multiselect ? (indeterminate ? "mixed" : selected) : undefined
          }
          aria-level={level}
          aria-disabled={disabled || undefined}
          tabIndex={isTabbable ? 0 : -1}
          onFocus={handleFocus}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("expanded")]: expanded,
              [withBaseName("selected")]: selected && !multiselect,
              [withBaseName("active")]: isActive,
              [withBaseName("disabled")]: disabled,
              [withBaseName("hasChildren")]: hasChildren,
            },
            className,
          )}
          style={
            {
              "--saltTreeNode-level": level,
            } as CSSProperties
          }
          {...rest}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled at tree level */}
          <div className={withBaseName("content")} onClick={handleContentClick}>
            <div className={withBaseName("row")}>
              <span
                className={withBaseName("expansion")}
                onClick={handleExpansionClick}
                aria-hidden="true"
              >
                {hasChildren && <ExpansionIcon expanded={expanded} />}
              </span>

              {multiselect && (
                <CheckboxIcon
                  checked={selected}
                  indeterminate={indeterminate}
                  disabled={disabled}
                  className={withBaseName("checkbox")}
                />
              )}

              {icon && <span className={withBaseName("icon")}>{icon}</span>}

              <span id={labelId} className={withBaseName("label")}>
                {label}
              </span>
            </div>
          </div>

          {hasChildren && expanded && (
            <ul role="group" className={withBaseName("group")}>
              {children}
            </ul>
          )}
        </li>
      </TreeNodeProvider>
    );
  },
);
