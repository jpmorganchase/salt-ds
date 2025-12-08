import { createContext, useContext } from "react";

interface TreeContextValue {
  registerNode: (
    value: string,
    element: HTMLElement,
    parentValue?: string,
    hasChildren?: boolean,
  ) => () => void;
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

interface TreeNodeContextValue {
  value: string;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  disabled?: boolean;
}

const TreeNodeContext = createContext<TreeNodeContextValue | undefined>(
  undefined,
);

export const TreeNodeProvider = TreeNodeContext.Provider;

export function useTreeNodeContext(): TreeNodeContextValue | undefined {
  // undefined is a valid state for root nodes
  return useContext(TreeNodeContext);
}
