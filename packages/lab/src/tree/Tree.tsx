import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  type FocusEvent,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import treeCss from "./Tree.css";
import { TreeProvider } from "./TreeContext";
import { useTree } from "./useTree";

export interface TreeProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * Default expanded nodes (uncontrolled)
   */
  defaultExpanded?: string[];
  /**
   * Expanded nodes (controlled)
   */
  expanded?: string[];
  /**
   * Callback on expanded nodes change
   */
  onExpandedChange?: (event: SyntheticEvent | null, expanded: string[]) => void;
  /**
   * Callback on node expanded or collapsed
   */
  onExpand?: (
    event: SyntheticEvent | null,
    value: string,
    expanded: boolean,
  ) => void;
  /**
   * Default selected nodes (uncontrolled)
   */
  defaultSelected?: string[];
  /**
   * Selected nodes
   */
  selected?: string[];
  /**
   * Callback on selected nodes change
   */
  onSelectionChange?: (event: SyntheticEvent, selected: string[]) => void;
  /**
   * Sets multiselect mode and allows for mutliple node selection
   */
  multiselect?: boolean;
  /**
   * Sets checkbox variant used for node selection
   */
  checkbox?: boolean;
  /**
   * Sets if selecting a parent node should also select its descendants
   * Only applies when multiselect or checkbox prop is enabled
   */
  propagateSelect?: boolean;
  /**
   * Sets if selecting all children should automatically select the parent
   * Only applies when multiselect or checkbox is enabled
   */
  propagateSelectUpwards?: boolean;
  /**
   * When set to false (default), clicking a seleced node has no effect.
   * When true, clicking a selected node will deselect it.
   */
  togglableSelect?: boolean;
  /**
   * Sets tree to disabled state, preventing all interaction
   */
  disabled?: boolean;
  /**
   * Default disabled node IDs (uncontrolled)
   */
  defaultDisabledIds?: string[];
  /**
   * Disabled node IDs (controlled).
   */
  disabledIds?: string[];
}

const withBaseName = makePrefixer("saltTree");

export const Tree = forwardRef<HTMLUListElement, TreeProps>(
  function Tree(props, ref) {
    const {
      children,
      className,
      defaultExpanded,
      expanded,
      onExpandedChange,
      onExpand,
      defaultSelected,
      selected,
      onSelectionChange,
      multiselect = false,
      checkbox = false,
      propagateSelect = false,
      propagateSelectUpwards = false,
      togglableSelect = false,
      disabled = false,
      defaultDisabledIds,
      disabledIds,
      onKeyDown,
      onBlur,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree",
      css: treeCss,
      window: targetWindow,
    });

    const treeState = useTree({
      defaultExpanded,
      expanded,
      onExpandedChange,
      onExpand,
      defaultSelected,
      selected,
      onSelectionChange,
      multiselect,
      checkbox,
      propagateSelect,
      propagateSelectUpwards,
      togglableSelect,
      disabled,
      defaultDisabledIds,
      disabledIds,
    });

    const {
      activeNode,
      setActiveNode,
      expandedState,
      toggleExpanded,
      select,
      selectedState,
      getVisibleNodes,
      getNode,
      getParent,
      getChildren,
      disabledIdsSet,
    } = treeState;

    const lastKeypressRef = useRef<string>("");
    const keypressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLUListElement>) => {
        onKeyDown?.(event);

        if (disabled) return;

        const visibleNodes = getVisibleNodes();
        if (visibleNodes.length === 0) return;

        const currentIndex = activeNode ? visibleNodes.indexOf(activeNode) : -1;

        let newActiveNode: string | undefined;
        let handled = false;

        switch (event.key) {
          case "ArrowDown": {
            handled = true;
            const nextIndex = currentIndex + 1;
            if (nextIndex < visibleNodes.length) {
              newActiveNode = visibleNodes[nextIndex];
            }
            break;
          }
          case "ArrowUp": {
            handled = true;
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0) {
              newActiveNode = visibleNodes[prevIndex];
            }
            break;
          }
          case "ArrowRight": {
            handled = true;
            if (activeNode) {
              const node = getNode(activeNode);
              if (node?.hasChildren) {
                if (!expandedState.has(activeNode)) {
                  toggleExpanded(activeNode);
                } else {
                  const firstChild = visibleNodes.find(
                    (visibleNode) => getParent(visibleNode) === activeNode,
                  );
                  if (firstChild) {
                    newActiveNode = firstChild;
                  }
                }
              }
            }
            break;
          }
          case "ArrowLeft": {
            handled = true;
            if (activeNode) {
              if (expandedState.has(activeNode)) {
                toggleExpanded(activeNode);
              } else {
                const parent = getParent(activeNode);
                if (parent) {
                  newActiveNode = parent;
                }
              }
            }
            break;
          }
          case "Home": {
            handled = true;
            newActiveNode = visibleNodes[0];
            break;
          }
          case "End": {
            handled = true;
            newActiveNode = visibleNodes[visibleNodes.length - 1];
            break;
          }
          case "Enter": {
            handled = true;
            if (activeNode) {
              select(event, activeNode);
            }
            break;
          }
          case " ": {
            handled = true;
            if (activeNode) {
              if (checkbox) {
                select(event, activeNode);
              } else {
                const node = getNode(activeNode);
                if (node?.hasChildren) {
                  toggleExpanded(activeNode);
                } else {
                  select(event, activeNode);
                }
              }
            }
            break;
          }
          case "*": {
            handled = true;
            if (activeNode) {
              const parent = getParent(activeNode);
              const siblings = parent
                ? getChildren(parent)
                : visibleNodes.filter((v) => !getParent(v));

              for (const sibling of siblings) {
                const siblingNode = getNode(sibling);
                if (siblingNode?.hasChildren && !expandedState.has(sibling)) {
                  toggleExpanded(sibling);
                }
              }
            }
            break;
          }
          default: {
            if (
              event.key.length === 1 &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey
            ) {
              handled = true;

              if (keypressTimeoutRef.current) {
                clearTimeout(keypressTimeoutRef.current);
              }

              lastKeypressRef.current += event.key.toLowerCase();
              const searchString = lastKeypressRef.current;

              keypressTimeoutRef.current = setTimeout(() => {
                lastKeypressRef.current = "";
              }, 500);

              const currentIndex = activeNode
                ? visibleNodes.indexOf(activeNode)
                : -1;
              let found = false;

              for (let i = currentIndex + 1; i < visibleNodes.length; i++) {
                const node = getNode(visibleNodes[i]);
                if (
                  node?.element?.textContent
                    ?.toLowerCase()
                    .startsWith(searchString)
                ) {
                  newActiveNode = visibleNodes[i];
                  found = true;
                  break;
                }
              }

              if (!found) {
                for (let i = 0; i <= currentIndex; i++) {
                  const node = getNode(visibleNodes[i]);
                  if (
                    node?.element?.textContent
                      ?.toLowerCase()
                      .startsWith(searchString)
                  ) {
                    newActiveNode = visibleNodes[i];
                    break;
                  }
                }
              }
            }
            break;
          }
        }

        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "a" &&
          (multiselect || checkbox)
        ) {
          handled = true;
          event.preventDefault();

          const allVisibleValues = visibleNodes.filter(
            (visibleNode) => !disabledIdsSet.has(visibleNode),
          );
          const allSelected = allVisibleValues.every((visible) =>
            selectedState.includes(visible),
          );

          const newSelected = allSelected ? [] : allVisibleValues;

          onSelectionChange?.(event, newSelected);
          return;
        }

        if (
          event.shiftKey &&
          (event.key === "ArrowUp" || event.key === "ArrowDown") &&
          (multiselect || checkbox)
        ) {
          handled = true;
          const isDown = event.key === "ArrowDown";
          const currentIndex = activeNode
            ? visibleNodes.indexOf(activeNode)
            : -1;
          const nextIndex = isDown ? currentIndex + 1 : currentIndex - 1;

          if (nextIndex >= 0 && nextIndex < visibleNodes.length) {
            const nextValue = visibleNodes[nextIndex];

            if (!disabledIdsSet.has(nextValue)) {
              select(event, nextValue);
              newActiveNode = nextValue;
            }
          }
        }

        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (newActiveNode !== undefined) {
          setActiveNode(newActiveNode);
        }
      },
      [
        onKeyDown,
        disabled,
        getVisibleNodes,
        activeNode,
        getNode,
        expandedState,
        toggleExpanded,
        getParent,
        getChildren,
        select,
        selectedState,
        checkbox,
        multiselect,
        setActiveNode,
        disabledIdsSet,
        onSelectionChange,
      ],
    );

    // might need to double check return focus behaviour
    const handleBlur = useCallback(
      (event: FocusEvent<HTMLUListElement>) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setActiveNode(undefined);
        }
      },
      [onBlur, setActiveNode],
    );

    // need to do this to apply aria-setsize and aria-posinset (via _posinst and _setsize)
    const childrenWithPosition = useMemo(() => {
      const childArray = Children.toArray(children);
      const validChildren = childArray.filter(isValidElement);
      const setSize = validChildren.length;

      return validChildren.map((child, index) =>
        cloneElement(
          child as ReactElement<{ _posinset?: number; _setsize?: number }>,
          {
            _posinset: index + 1,
            _setsize: setSize,
          },
        ),
      );
    }, [children]);

    return (
      <TreeProvider value={treeState}>
        <ul
          ref={ref}
          role="tree"
          aria-multiselectable={multiselect ? true : undefined}
          aria-disabled={disabled || undefined}
          className={clsx(
            withBaseName(),
            { [withBaseName("disabled")]: disabled },
            className,
          )}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          {...rest}
        >
          {childrenWithPosition}
        </ul>
      </TreeProvider>
    );
  },
);
