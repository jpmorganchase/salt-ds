import { useCallback, useRef } from "react";

interface NodeInfo {
  element: HTMLElement;
  parentValue?: string;
  hasChildren?: boolean;
}

export function useTree(props?: any) {
  const nodesRef = useRef<Map<string, NodeInfo>>(new Map());

  const registerNode = useCallback(
    (
      value: string,
      element: HTMLElement,
      parentValue?: string,
      hasChildren?: boolean,
    ) => {
      nodesRef.current.set(value, { element, parentValue, hasChildren });

      return () => {
        nodesRef.current.delete(value);
      };
    },
    [],
  );

  return { registerNode };
}
