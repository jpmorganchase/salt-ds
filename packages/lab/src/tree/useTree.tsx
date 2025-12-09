import { useControlled } from "@salt-ds/core";
import {
  type SyntheticEvent,
  useCallback,
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

interface NodeInfo {
  /** The DOM element reference for this node */
  element: HTMLElement;
  /** The parent node's value (undefined for root nodes) */
  parentValue?: string;
  /** Whether this node has children */
  hasChildren?: boolean;
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
    checkbox = false,
    propagateSelect = false,
    propagateSelectUpwards = false,
    togglableSelect = false,
    disabled = false,
    defaultDisabledIds = [],
    disabledIds: disabledIdsProp,
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

  const getNode = useCallback((value: string) => {
    return nodesRef.current.get(value);
  }, []);

  const getParent = useCallback((value: string): string | undefined => {
    return nodesRef.current.get(value)?.parentValue;
  }, []);

  const getChildren = useCallback((parentValue: string): string[] => {
    const children: string[] = [];
    for (const [value, info] of nodesRef.current) {
      if (info.parentValue === parentValue) {
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

      if (multiselect || checkbox) {
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
      if (checkbox) {
        const newIndeterminate = calculateIndeterminateState(newSelected);
        setIndeterminateState(newIndeterminate);
      }
      onSelectionChange?.(event, newSelected);
    },
    [
      disabled,
      disabledIdsSet,
      multiselect,
      checkbox,
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
    expandedState,
    toggleExpanded,
    selectedState,
    select,
    multiselect,
    checkbox,
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
  };
}
