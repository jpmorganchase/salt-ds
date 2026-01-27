import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type SyntheticEvent,
  useContext,
} from "react";
import type { TreeModel, TreeNodeMeta } from "./useTree";

export interface TreeContextValue {
  expandedState: Set<string>;
  /** Toggle a node expansion state */
  toggleExpanded: (event: SyntheticEvent, value: string) => void;

  /** Selected node values */
  selectedState: string[];
  /** Set selected state directly */
  setSelectedState: Dispatch<SetStateAction<string[]>>;
  /** Select node */
  select: (event: SyntheticEvent, value: string) => void;

  /** Whether multiselect mode with checkboxes is enabled */
  multiselect: boolean;
  /** Disabled state of the tree */
  disabled: boolean;
  /** Set of disabled node IDs */
  disabledIdsSet: Set<string>;

  /** Tree model for traversal */
  treeModel: TreeModel;
  /** Get node metadata from tree model */
  getNodeMeta: (value: string) => TreeNodeMeta | undefined;
  /** Get parent of a node */
  getParent: (value: string) => string | undefined;
  /** Get children of a node */
  getChildren: (value: string) => string[];
  /** Get all descendants of a node */
  getDescendants: (value: string) => string[];
  /** Get all ancestors of a node */
  getAncestors: (value: string) => string[];
  /** Get all visible (navigable) nodes in tree order */
  getVisibleNodes: () => string[];
  /** Get the first visible node */
  getFirstVisibleNode: () => string | undefined;
  /** Get the first selected visible node */
  getFirstSelectedVisibleNode: () => string | undefined;
  /** Register a DOM element for focus management */
  registerElement: (value: string, element: HTMLElement) => () => void;
  /** Get DOM element for a node (if mounted) */
  getElement: (value: string) => HTMLElement | undefined;
  /** Register a trigger element for focus management */
  registerTrigger: (value: string, element: HTMLElement) => () => void;
  /** Get trigger element for a node (if mounted) */
  getTrigger: (value: string) => HTMLElement | undefined;
  /** Active node value */
  activeNode: string | undefined;
  /** Set the active node */
  setActiveNode: Dispatch<SetStateAction<string | undefined>>;

  /** Set of indeterminate (partially selected) node IDs */
  indeterminateState: Set<string>;
}

const TreeContext = createContext<TreeContextValue | undefined>(
  "Tree Context",
  undefined,
);

export const TreeProvider = TreeContext.Provider;

export function useTreeContext(): TreeContextValue {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTreeContext must be used within a TreeProvider");
  }
  return context;
}

export interface TreeNodeContextValue {
  /** Current node value */
  value: string;
  /** Current depth level */
  level: number;
  /** Whether node has children */
  hasChildren: boolean;
  /** Whether node is expanded */
  expanded: boolean;
  /** Whether node is disabled */
  disabled: boolean;
  /** Label element id for aria-labelledby */
  labelId: string;
  /** Node id for the li element */
  id: string;
  /** Whether node is selected */
  selected: boolean;
  /** Whether node is in indeterminate state (partially selected children) */
  indeterminate: boolean;
  /** Child TreeNode elements to be rendered inside the group */
  nodeChildren: ReactNode;
}

const TreeNodeContext = createContext<TreeNodeContextValue | undefined>(
  "TreeNodeContext",
  undefined,
);

export const TreeNodeProvider = TreeNodeContext.Provider;

export function useTreeNodeContext(): TreeNodeContextValue | undefined {
  return useContext(TreeNodeContext);
}
