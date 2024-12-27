import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type MutableRefObject,
} from "react";

import type { TreeNode } from "./TreeNode";

export const DepthContext = createContext(-1);
export const ActiveIdContext = createContext<string | null>(null);
export const SetActiveIdContext = createContext((id: string) => {});
export const ParentContext = createContext<TreeNode.Record | null>(null);
export const FlatTreeContext = createContext<TreeNode.Record[]>([]);
export const TreeContext = createContext<MutableRefObject<TreeNode.Record[]>>({
  current: [],
});

export interface TreeProviderProps {
  parent?: TreeNode.Record;
  children: ReactNode;
}

export function TreeProvider({ parent, children }: TreeProviderProps) {
  const depth = useContext(DepthContext);
  const tree = useRef<TreeNode.Record[]>([]);
  const flatTree = useRef<TreeNode.Record[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  if (depth === -1) {
    return (
      <DepthContext.Provider value={depth + 1}>
        <TreeContext.Provider value={tree}>
          <ActiveIdContext.Provider value={activeId}>
            <SetActiveIdContext.Provider value={setActiveId}>
              {children}
            </SetActiveIdContext.Provider>
          </ActiveIdContext.Provider>
        </TreeContext.Provider>
      </DepthContext.Provider>
    );
  }

  if (parent) {
    return (
      <DepthContext.Provider value={depth + 1}>
        <ParentContext.Provider value={parent}>
          {children}
        </ParentContext.Provider>
      </DepthContext.Provider>
    );
  }

  return (
    <DepthContext.Provider value={depth + 1}>{children}</DepthContext.Provider>
  );
}
