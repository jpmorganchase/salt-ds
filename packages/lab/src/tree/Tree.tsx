import {
  useReducer,
  useEffect,
  createContext,
  type ReactNode,
  type ComponentProps,
  type KeyboardEvent,
  type Dispatch,
} from "react";

import treeReducer from "./Tree.reducer";
import type Node from "./Node";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import treeCSS from "./Tree.css";

export const DepthContext = createContext<Node.Depth>(-1);
export const ActiveIdContext = createContext<Node.Id>("");
export const ExpandedIdsContext = createContext<Set<Node.Id>>(new Set());
export const SelectedIdsContext = createContext<Set<Node.Id>>(new Set());
export const IdToElementContext = createContext<Map<Node.Id, Node.Element>>(
  new Map(),
);
export const IdToChildrenIdsContext = createContext<Map<Node.Id, Set<Node.Id>>>(
  new Map(),
);
export const DispatchContext = createContext<Dispatch<Tree.Action>>(() => ({}));

const withBaseName = makePrefixer("saltTree");

namespace Tree {
  export interface Props extends ComponentProps<"ul"> {
    children?: ReactNode;
  }

  export type IdToElement = Map<Node.Id, Node.Element>;
  export type IdToParentId = Map<Node.Id, Node.ParentId>;
  export type IdToChildrenIds = Map<Node.ParentId, Set<Node.Id>>;
  export type CharToNodeIds = Map<Node.Char, Set<Node.Id>>;

  export interface State {
    idToElement: Tree.IdToElement;
    idToParentId: Tree.IdToParentId;
    idToChildrenIds: Tree.IdToChildrenIds;

    charToNodeIds: Tree.CharToNodeIds;

    activeId: Node.Id;
    leafIds: Set<Node.Id>;
    expandedIds: Set<Node.Id>;
    selectedIds: Set<Node.Id>;
  }

  export type Action =
    | {
        type: "register";
        payload: {
          id: Node.Id;
          element: Node.Element;
          label: Node.Label;
          parentId: Node.Id | null;
          isLeaf: boolean;
        };
      }
    | {
        type: "unregister";
        payload: {
          id: Node.Id;
          label: Node.Label;
        };
      }
    | { type: "focus/first" }
    | { type: "focus/last" }
    | { type: "focus/next" }
    | { type: "focus/previous" }
    | { type: "focus/parent" }
    | { type: "focus/id"; payload: Node.Id }
    | { type: "focus/char"; payload: Node.Char }
    | { type: "expand/level" }
    | { type: "expand/active" }
    | { type: "expand/id"; payload: Node.Id }
    | { type: "collapse/active" }
    | { type: "toggle/active" }
    | { type: "toggle/id"; payload: Node.Id }
    | { type: "select/level" }
    | { type: "select/active" }
    | { type: "select/id"; payload: Node.Id }
    | { type: "select/reset" }
    | { type: "select/range"; payload: [Node.Id, Node.Id] }
    | { type: "deselect/all" }
    | { type: "deselect/active" }
    | { type: "deselect/id"; payload: Node.Id };
}

function Tree({ children }: Tree.Props) {
  const [state, dispatch] = useReducer(treeReducer, {
    activeId: "",
    leafIds: new Set(),
    expandedIds: new Set(),
    selectedIds: new Set(),
    idToElement: new Map(),
    idToParentId: new Map(),
    idToChildrenIds: new Map(),
    charToNodeIds: new Map(),
  } as Tree.State);
  const targetWindow = useWindow();

  useEffect(() => {
    if (state.activeId) {
      state.idToElement.get(state.activeId)?.focus();
    }
  }, [state.activeId]);

  useComponentCssInjection({
    testId: "salt-tree",
    css: treeCSS,
    window: targetWindow,
  });

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        return dispatch({ type: "focus/next" });
      }
      case "ArrowUp": {
        event.preventDefault();

        return dispatch({ type: "focus/previous" });
      }
      case "ArrowRight": {
        event.preventDefault();

        if (state.expandedIds.has(state.activeId)) {
          return dispatch({ type: "focus/next" });
        }

        return dispatch({ type: "expand/active" });
      }
      case "ArrowLeft": {
        event.preventDefault();

        if (state.expandedIds.has(state.activeId)) {
          return dispatch({
            type: "collapse/active",
          });
        }

        return dispatch({
          type: "focus/parent",
        });
      }
      case "Enter": {
        event.preventDefault();
        return dispatch({
          type: "toggle/active",
        });
      }
      case "Home": {
        event.preventDefault();
        return dispatch({
          type: "focus/first",
        });
      }
      case "End": {
        event.preventDefault();
        return dispatch({
          type: "focus/last",
        });
      }
      case "*": {
        event.preventDefault();
        return dispatch({
          type: "expand/level",
        });
      }
      case " ": {
        event.preventDefault();
        return dispatch({
          type: "select/active",
        });
      }
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
      case "a": {
        if (event.metaKey) {
          event.preventDefault();
          return dispatch({
            type: "select/level",
          });
        }
        // fall through
      }
      default: {
        const char = event.key.toUpperCase();

        if (event.code !== `Key${char}`) return;

        return dispatch({
          type: "focus/char",
          payload: char,
        });
      }
    }
  }

  function handleFocus() {
    if (!state.activeId) {
      dispatch({
        type: "focus/first",
      });
    }
  }

  const tabIndex = state.activeId ? -1 : 0;

  return (
    <DepthContext.Provider value={0}>
      <DispatchContext.Provider value={dispatch}>
        <ActiveIdContext.Provider value={state.activeId}>
          <SelectedIdsContext.Provider value={state.selectedIds}>
            <ExpandedIdsContext.Provider value={state.expandedIds}>
              <IdToElementContext.Provider value={state.idToElement}>
                <IdToChildrenIdsContext.Provider value={state.idToChildrenIds}>
                  <ul
                    role="tree"
                    tabIndex={tabIndex}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className={withBaseName()}
                  >
                    {children}
                  </ul>
                </IdToChildrenIdsContext.Provider>
              </IdToElementContext.Provider>
            </ExpandedIdsContext.Provider>
          </SelectedIdsContext.Provider>
        </ActiveIdContext.Provider>
      </DispatchContext.Provider>
    </DepthContext.Provider>
  );
}

export default Tree;
