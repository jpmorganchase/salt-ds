import {
  createContext,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
  useContext,
} from "react";

export interface TreeContextValue {
  /** Set of expanded node values (Set for faster lookup) */
  expandedState: Set<string>;
  /** Toggle a node expansion state */
  toggleExpanded: (value: string) => void;
  /** Selected node values */
  selectedState: string[];
  /** Select node */
  select: (event: SyntheticEvent, value: string) => void;
  /** Whether multiselect is enabled */
  multiselect: boolean;
  /** Whether checkbox variant is enabled */
  checkbox: boolean;
  /**
   * Sets if selecting a parent node should also select its descendants
   * Only applies when multiselect or checkbox prop is enabled
   */
  propagateSelect: boolean;
  /**
   * Sets if selecting all children should automatically select the parent
   * Only applies when multiselect or checkbox is enabled
   */
  propagateSelectUpwards: boolean;
  /** Sets if selection can be toggled off in single-select mode */
  togglableSelect: boolean;
  /** Register a node with the tree */
  registerNode: (
    value: string,
    element: HTMLElement,
    parentValue?: string,
    hasChildren?: boolean,
  ) => () => void;
  /** Get node info from registry */
  getNode: (
    value: string,
  ) => { element: HTMLElement; hasChildren?: boolean } | undefined;
  /** Get parent of a node */
  getParent: (value: string) => string | undefined;
  /** Get children of a node */
  getChildren: (value: string) => string[];
  /** Get all descendants of a node */
  getDescendants: (value: string) => string[];
  /** Get all ancestors of a node */
  getAncestors: (value: string) => string[];
  /** Get all visible nodes in DOM order */
  getVisibleNodes: () => string[];
  /** Get the first visible node  */
  getFirstVisibleNode: () => string | undefined;
  /** Active node value  */
  activeNode: string | undefined;
  /** Set the active node */
  setActiveNode: Dispatch<SetStateAction<string | undefined>>;
  /** Whether focus is visible */
  focusVisible: boolean;
  /** Set focus visible state */
  setFocusVisible: Dispatch<SetStateAction<boolean>>;
  /** Disabled state of of tree */
  disabled: boolean;
  /** Set of disabled node IDs */
  disabledIdsSet: Set<string>;
  /** Set of indeterminate (partially selected) node IDs */
  indeterminateState: Set<string>;
  /** Whether the tree has mounted (for initial tabindex) */
  mounted: boolean;
}

const TreeContext = createContext<TreeContextValue | undefined>(undefined);

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
}

const TreeNodeContext = createContext<TreeNodeContextValue | undefined>(
  undefined,
);

export const TreeNodeProvider = TreeNodeContext.Provider;

export function useTreeNodeContext(): TreeNodeContextValue | undefined {
  return useContext(TreeNodeContext);
}
