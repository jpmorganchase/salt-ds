import { useControlled } from "@salt-ds/core";
import {
  Children,
  isValidElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface UseTreeProps {
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
   * Callback on node expanded or collapsed
   */
  onExpand?: (
    event: SyntheticEvent | null,
    value: string,
    expanded: boolean,
  ) => void;
  /**
   * Sets multiselect mode with checkboxes and allows for multiple node selection
   */
  multiselect?: boolean;
  /**
   * Sets if selecting a parent node should also select its descendants
   * Only applies when multiselect is enabled
   */
  propagateSelect?: boolean;
  /**
   * Sets if selecting all children should automatically select the parent
   * Only applies when multiselect is enabled
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
  /**
   * Tree children used to extract parent-child relationships for deriving the indeterminate state calculations
   * on initial render
   */
  children?: ReactNode;
}

interface NodeInfo {
  /** The DOM element reference for this node */
  element: HTMLElement;
  /** The parent node's value (undefined for root nodes) */
  parentValue?: string;
  /** Whether this node has children */
  hasChildren?: boolean;
  /** Whether this node is disabled */
  disabled?: boolean;
}

// We need to do this so we can do things like set defaults
// note to self: maybe we can use this for more related node relationship cases
function extractParentMap(
  children: ReactNode,
  parentValue?: string,
): Map<string, string> {
  const parentMap = new Map<string, string>();

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props.value) {
      const value = child.props.value as string;
      if (parentValue) {
        parentMap.set(value, parentValue);
      }
      if (child.props.children) {
        const childMap = extractParentMap(child.props.children, value);
        for (const [key, val] of childMap) {
          parentMap.set(key, val);
        }
      }
    }
  });

  return parentMap;
}

export function useTree(props: UseTreeProps) {
  const {
    defaultExpanded = [],
    expanded: expandedProp,
    onExpandedChange,
    onExpand,
    defaultSelected = [],
    selected: selectedProp,
    onSelectionChange,
    multiselect = false,
    propagateSelect = true,
    propagateSelectUpwards = true,
    togglableSelect = false,
    disabled = false,
    defaultDisabledIds = [],
    disabledIds: disabledIdsProp,
    children,
  } = props;

  const [expandedArray, setExpandedArray] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: "Tree",
    state: "expanded",
  });

  // Convert array to Set for more efficient lookups during rendering and nav
  const expandedState = useMemo(() => new Set(expandedArray), [expandedArray]);

  const [selectedState, setSelectedState] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: "Tree",
    state: "selected",
  });

  const [disabledIdsArray] = useControlled({
    controlled: disabledIdsProp,
    default: defaultDisabledIds,
    name: "Tree",
    state: "disabledIds",
  });

  const disabledIdsSet = useMemo(
    () => new Set(disabledIdsArray),
    [disabledIdsArray],
  );

  const [indeterminateState, setIndeterminateState] = useState<Set<string>>(
    new Set(),
  );

  const [activeNode, setActiveNode] = useState<string | undefined>(undefined);

  const [focusVisible, setFocusVisible] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nodesRef = useRef<Map<string, NodeInfo>>(new Map());
  // Persistent parent map - needed to calculate indeterminate calculations for nodes that have children that are still in selection
  const parentMapRef = useRef<Map<string, string>>(new Map());

  // Pre-populate parent map from JSX children structure on initial render
  // This ensures indeterminate state works correctly even for unmounted nodes
  const initialParentMap = useMemo(
    () => extractParentMap(children),
    [children],
  );
  // Merge initial parent map into persistent ref
  for (const [key, value] of initialParentMap) {
    if (!parentMapRef.current.has(key)) {
      parentMapRef.current.set(key, value);
    }
  }

  const registerNode = useCallback(
    (
      value: string,
      element: HTMLElement,
      parentValue?: string,
      hasChildren?: boolean,
      disabled?: boolean,
    ) => {
      nodesRef.current.set(value, {
        element,
        parentValue,
        hasChildren,
        disabled,
      });
      // Store parent relationship persistently (never cleared)
      if (parentValue) {
        parentMapRef.current.set(value, parentValue);
      }

      return () => {
        nodesRef.current.delete(value);
        // Note: we intentionally do NOT delete from parentMapRef
        // to preserve relationships for indeterminate calculation
      };
    },
    [],
  );

  const getNode = useCallback((value: string) => {
    return nodesRef.current.get(value);
  }, []);

  const getParent = useCallback((value: string): string | undefined => {
    // Check mounted nodes first, then fall back to persistent parent map
    return (
      nodesRef.current.get(value)?.parentValue ??
      parentMapRef.current.get(value)
    );
  }, []);

  const getChildren = useCallback((parentValue: string): string[] => {
    const children: string[] = [];
    const seen = new Set<string>();

    // These two lookups are sub-optimal - double o(N) for indeterminate calculation.
    // could use a reverse lookup map if need be
    for (const [value, info] of nodesRef.current) {
      if (info.parentValue === parentValue) {
        children.push(value);
        seen.add(value);
      }
    }
    for (const [value, parent] of parentMapRef.current) {
      if (parent === parentValue && !seen.has(value)) {
        children.push(value);
      }
    }
    return children;
  }, []);

  const getDescendants = useCallback(
    (value: string): string[] => {
      const descendants: string[] = [];
      const children = getChildren(value);

      for (const child of children) {
        if (!disabledIdsSet.has(child)) {
          descendants.push(child);
          descendants.push(...getDescendants(child));
        }
      }

      return descendants;
    },
    [getChildren, disabledIdsSet],
  );

  const getAncestors = useCallback(
    (value: string): string[] => {
      const ancestors: string[] = [];
      let current = getParent(value);

      while (current) {
        ancestors.push(current);
        current = getParent(current);
      }

      return ancestors;
    },
    [getParent],
  );

  const toggleExpanded = useCallback(
    (value: string) => {
      const isExpanding = !expandedState.has(value);
      const newExpanded = isExpanding
        ? [...expandedArray, value]
        : expandedArray.filter((v) => v !== value);

      setExpandedArray(newExpanded);
      onExpandedChange?.(null, newExpanded);
      onExpand?.(null, value, isExpanding);
    },
    [expandedArray, expandedState, onExpandedChange, onExpand],
  );

  const calculateIndeterminateState = useCallback(
    (selected: string[]): Set<string> => {
      const indeterminate = new Set<string>();
      const selectedSet = new Set(selected);

      for (const selectedValue of selected) {
        let current = getParent(selectedValue);

        while (current) {
          const children = getChildren(current);
          const enabledChildren = children.filter(
            (child) => !disabledIdsSet.has(child),
          );

          if (enabledChildren.length === 0) {
            current = getParent(current);
            continue;
          }

          const selectedChildren = enabledChildren.filter((child) =>
            selectedSet.has(child),
          );
          const allChildrenSelected =
            selectedChildren.length === enabledChildren.length;
          const someChildrenSelected = selectedChildren.length > 0;

          const someChildrenIndeterminate = enabledChildren.some((child) =>
            indeterminate.has(child),
          );

          if (
            someChildrenIndeterminate ||
            (someChildrenSelected && !allChildrenSelected)
          ) {
            indeterminate.add(current);
          }

          current = getParent(current);
        }
      }

      return indeterminate;
    },
    [getParent, getChildren, disabledIdsSet],
  );

  useEffect(() => {
    if (multiselect && mounted) {
      const newIndeterminate = calculateIndeterminateState(selectedState);
      setIndeterminateState(newIndeterminate);
    }
  }, [multiselect, mounted, selectedState, calculateIndeterminateState]);

  const updateAncestors = useCallback(
    (currentSelected: string[], value: string) => {
      if (!propagateSelectUpwards) return currentSelected;

      let nextSelected = [...currentSelected];
      const nextSelectedSet = new Set(nextSelected);
      const ancestors = getAncestors(value);

      for (const ancestor of ancestors) {
        const children = getChildren(ancestor);
        const enabledChildren = children.filter(
          (child) => !disabledIdsSet.has(child),
        );

        if (enabledChildren.length === 0) continue;

        const allSelected = enabledChildren.every((child) =>
          nextSelectedSet.has(child),
        );
        const ancestorSelected = nextSelectedSet.has(ancestor);

        if (allSelected && !ancestorSelected) {
          nextSelected.push(ancestor);
          nextSelectedSet.add(ancestor);
        } else if (!allSelected && ancestorSelected) {
          nextSelected = nextSelected.filter((v) => v !== ancestor);
          nextSelectedSet.delete(ancestor);
        }
      }

      return nextSelected;
    },
    [getAncestors, getChildren, disabledIdsSet, propagateSelectUpwards],
  );

  const getMultiSelectState = useCallback(
    (value: string) => {
      const isCurrentlySelected = selectedState.includes(value);
      let newSelected: string[];

      if (isCurrentlySelected) {
        newSelected = selectedState.filter((v) => v !== value);

        if (propagateSelect) {
          const descendants = getDescendants(value);
          newSelected = newSelected.filter((v) => !descendants.includes(v));
        }
      } else {
        newSelected = [...selectedState, value];

        if (propagateSelect) {
          const descendants = getDescendants(value);
          const newDescendants = descendants.filter(
            (d) => !newSelected.includes(d),
          );
          newSelected = [...newSelected, ...newDescendants];
        }
      }

      return updateAncestors(newSelected, value);
    },
    [selectedState, propagateSelect, getDescendants, updateAncestors],
  );

  const select = useCallback(
    (event: SyntheticEvent, value: string) => {
      if (disabled || disabledIdsSet.has(value)) return;

      let newSelected: string[];

      if (multiselect) {
        newSelected = getMultiSelectState(value);
      } else {
        const isCurrentlySelected = selectedState.includes(value);
        if (togglableSelect) {
          newSelected = isCurrentlySelected ? [] : [value];
        } else {
          newSelected = [value];
        }
      }

      setSelectedState(newSelected);
      if (multiselect) {
        const newIndeterminate = calculateIndeterminateState(newSelected);
        setIndeterminateState(newIndeterminate);
      }
      onSelectionChange?.(event, newSelected);
    },
    [
      disabled,
      disabledIdsSet,
      multiselect,
      selectedState,
      togglableSelect,
      getMultiSelectState,
      calculateIndeterminateState,
      onSelectionChange,
    ],
  );

  const getVisibleNodes = useCallback((): string[] => {
    const entries = Array.from(nodesRef.current.entries());

    const visibleNodes = entries.filter(([_value, info]) => {
      if (info.disabled) {
        return false;
      }

      let currentParent = info.parentValue;
      while (currentParent) {
        if (!expandedState.has(currentParent)) {
          return false;
        }
        currentParent = nodesRef.current.get(currentParent)?.parentValue;
      }
      return true;
    });

    // we need to do this because Map doesnt guarantee order
    visibleNodes.sort((a, b) => {
      const aEl = a[1].element;
      const bEl = b[1].element;
      const position = aEl.compareDocumentPosition(bEl);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return visibleNodes.map(([value]) => value);
  }, [expandedState]);

  const getFirstVisibleNode = useCallback((): string | undefined => {
    const visibleNodes = getVisibleNodes();
    return visibleNodes[0];
  }, [getVisibleNodes]);

  return {
    expandedArray,
    setExpandedArray,
    expandedState,
    toggleExpanded,
    selectedState,
    setSelectedState,
    select,
    multiselect,
    propagateSelect,
    propagateSelectUpwards,
    togglableSelect,
    registerNode,
    getNode,
    getParent,
    getChildren,
    getDescendants,
    getAncestors,
    getVisibleNodes,
    getFirstVisibleNode,
    activeNode,
    setActiveNode,
    focusVisible,
    setFocusVisible,
    disabled,
    disabledIdsSet,
    indeterminateState,
    mounted,
  };
}
