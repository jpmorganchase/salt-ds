import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useEffect,
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
  onExpandedChange?: (event: SyntheticEvent, expanded: string[]) => void;
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
   * Sets multiselect mode with checkboxes and allows for multiple node selection
   */
  multiselect?: boolean;
  /**
   * Sets tree to disabled state, preventing all interaction
   */
  disabled?: boolean;
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
      defaultSelected,
      selected,
      onSelectionChange,
      multiselect = false,
      disabled = false,
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
      defaultSelected,
      selected,
      onSelectionChange,
      multiselect,
      disabled,
      children,
    });

    const {
      activeNode,
      setActiveNode,
      expandedArray,
      setExpandedArray,
      expandedState,
      toggleExpanded,
      select,
      selectedState,
      setSelectedState,
      visibleNodes,
      getNodeMeta,
      getElement,
      getParent,
      getChildren,
      treeModel,
      disabledIdsSet,
    } = treeState;

    const lastKeypressRef = useRef<string>("");
    const keypressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const treeRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      return () => {
        if (keypressTimeoutRef.current) {
          clearTimeout(keypressTimeoutRef.current);
        }
      };
    }, []);

    const handleBlur = (event: FocusEvent<HTMLUListElement>) => {
      onBlur?.(event);
      const relatedTarget = event.relatedTarget as Node | null;
      if (!treeRef.current?.contains(relatedTarget)) {
        setActiveNode(undefined);
      }
    };

    const focusNode = (
      value: string,
    ): "focused" | "already-focused" | "missing" => {
      const element = getElement(value);
      if (!element) {
        return "missing";
      }

      const activeEl = targetWindow?.document.activeElement;
      if (activeEl === element) {
        return "already-focused";
      }

      element.focus();
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
      return "focused";
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(event);

      if (disabled) return;

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
            const nodeMeta = getNodeMeta(activeNode);
            const isDisabled = disabledIdsSet.has(activeNode);
            if (!isDisabled && nodeMeta?.hasChildren) {
              if (!expandedState.has(activeNode)) {
                toggleExpanded(event, activeNode);
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
            const isDisabled = disabledIdsSet.has(activeNode);
            if (!isDisabled) {
              if (expandedState.has(activeNode)) {
                toggleExpanded(event, activeNode);
              } else {
                const parent = getParent(activeNode);
                if (parent) {
                  newActiveNode = parent;
                }
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
            select(event, activeNode);
          }
          break;
        }
        case "*": {
          handled = true;
          if (activeNode) {
            const parent = getParent(activeNode);
            // Get siblings: either children of parent, or root nodes if no parent
            const siblings = parent
              ? getChildren(parent)
              : treeModel.rootValues;

            const toExpand = siblings.filter((sibling) => {
              const siblingMeta = getNodeMeta(sibling);
              return (
                siblingMeta?.hasChildren &&
                !expandedState.has(sibling) &&
                !disabledIdsSet.has(sibling)
              );
            });

            if (toExpand.length > 0) {
              const newExpanded = [...expandedArray, ...toExpand];
              setExpandedArray(newExpanded);
              onExpandedChange?.(event, newExpanded);
            }
          }
          break;
        }
        default: {
          // Type-ahead
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
              const element = getElement(visibleNodes[i]);
              if (
                element?.textContent?.toLowerCase().startsWith(searchString)
              ) {
                newActiveNode = visibleNodes[i];
                found = true;
                break;
              }
            }

            if (!found) {
              for (let i = 0; i <= currentIndex; i++) {
                const element = getElement(visibleNodes[i]);
                if (
                  element?.textContent?.toLowerCase().startsWith(searchString)
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
        multiselect
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

        setSelectedState(newSelected);
        onSelectionChange?.(event, newSelected);
        return;
      }

      if (
        event.shiftKey &&
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        multiselect
      ) {
        handled = true;
        const isDown = event.key === "ArrowDown";
        const currentIndex = activeNode ? visibleNodes.indexOf(activeNode) : -1;
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
        const focusResult = focusNode(newActiveNode);
        if (focusResult !== "focused") {
          setActiveNode(newActiveNode);
        }
      }
    };

    const handleRef = useForkRef(treeRef, ref);

    return (
      <TreeProvider value={treeState}>
        <ul
          ref={handleRef}
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
          {children}
        </ul>
      </TreeProvider>
    );
  },
);
