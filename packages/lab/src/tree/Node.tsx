import {
  useContext,
  useEffect,
  useCallback,
  createContext,
  type ReactNode,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
} from "react";

import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import {
  ActiveIdContext,
  DepthContext,
  DispatchContext,
  ExpandedIdsContext,
  SelectedIdsContext,
} from "./Tree";
import nodeCSS from "./Node.css";

export const ParentIdContext = createContext<Node.ParentId>(null);
export const ParentExpandedContext = createContext<boolean>(true);

export type Char = string;

const withBaseName = makePrefixer("saltNode");

namespace Node {
  export interface Props extends ComponentProps<"li"> {
    id?: Node.Id;
    label: Node.Label;
    value?: string;
    defaultExpanded?: boolean;
    children?: ReactNode;
  }

  export type Id = string;
  export type Label = string;
  export type Depth = number;
  export type Element = HTMLLIElement;
  export type ParentId = Node.Id | null;
  export type Char = string;
}

function Node({
  id: idProp,
  label,
  defaultExpanded = false,
  children,
  ...props
}: Node.Props) {
  const id = useId(idProp)!;
  const depth = useContext(DepthContext);
  const activeId = useContext(ActiveIdContext);
  const parentId = useContext(ParentIdContext);
  const expandedIds = useContext(ExpandedIdsContext);
  const selectedIds = useContext(SelectedIdsContext);
  const isParentExpanded = useContext(ParentExpandedContext);
  const dispatch = useContext(DispatchContext);
  const targetWindow = useWindow();

  const isLeaf = !children;
  const isActive = id === activeId;
  const isExpanded = expandedIds.has(id);
  const isSelected = selectedIds.has(id);

  useComponentCssInjection({
    testId: "salt-node",
    css: nodeCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if (defaultExpanded) {
      dispatch({
        type: "expand/id",
        payload: id,
      });
    }
  }, []);

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    dispatch({
      type: "focus/id",
      payload: id,
    });

    if (event.shiftKey) {
      dispatch({
        type: "select/range",
        payload: [activeId, id],
      });
    } else {
      dispatch({ type: "select/active" });
    }

    if (!isLeaf) {
      dispatch({
        type: "toggle/id",
        payload: id,
      });
    }
  }

  const handleRef = useCallback(
    (element: HTMLLIElement) => {
      if (!element || !isParentExpanded) {
        return;
      }

      if (isParentExpanded) {
        dispatch({
          type: "register",
          payload: {
            id,
            element,
            label,
            isLeaf,
            parentId,
          },
        });
      }

      return () => {
        dispatch({
          type: "unregister",
          payload: {
            id,
            label,
          },
        });
      };
    },
    [isParentExpanded],
  );

  return (
    <li
      id={id}
      ref={handleRef}
      role="treeitem"
      aria-expanded={isExpanded}
      aria-selected={isSelected}
      data-label={label}
      data-parent-id={parentId}
      data-is-active={isActive}
      data-is-leaf={isLeaf}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      className={withBaseName()}
      style={
        {
          "--node-depth": depth,
        } as CSSProperties
      }
      {...props}
    >
      <span>
        {isLeaf ? "🍃  " : isExpanded ? "⬆️  " : "⬇️  "}
        {label}
      </span>
      {!isLeaf && (
        <DepthContext.Provider value={depth + 1}>
          <ParentIdContext.Provider value={id}>
            <ParentExpandedContext.Provider value={isExpanded}>
              <ul role="group" className={withBaseName("group")}>
                {children}
              </ul>
            </ParentExpandedContext.Provider>
          </ParentIdContext.Provider>
        </DepthContext.Provider>
      )}
    </li>
  );
}

export default Node;
