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
  /**
   * Tree children used to build the tree model for traversal an state management
   */
  children?: ReactNode;
}

export interface TreeNodeMeta {
  value: string;
  parentValue: string | undefined;
  hasChildren: boolean;
  disabled: boolean;
}

export interface TreeModel {
  /** All nodes indexed by value */
  nodes: Map<string, TreeNodeMeta>;
  /** Ordered list of root node values */
  rootValues: string[];
  /** Maps parent value to ordered list of child values */
  childrenOf: Map<string, string[]>;
}

function buildTreeModel(children: ReactNode): TreeModel {
  const nodes = new Map<string, TreeNodeMeta>();
  const rootValues: string[] = [];
  const childrenOf = new Map<string, string[]>();

  function traverse(
    reactChildren: ReactNode,
    parentValue?: string,
    parentDisabled = false,
  ): void {
    const siblingValues: string[] = [];

    Children.forEach(reactChildren, (child) => {
      if (isValidElement(child) && typeof child.props.value === "string") {
        const value = child.props.value;
        const nodeChildren = child.props.children;
        const hasChildren = Children.count(nodeChildren) > 0;
        const disabled = parentDisabled || Boolean(child.props.disabled);

        nodes.set(value, {
          value,
          parentValue,
          hasChildren,
          disabled,
        });

        siblingValues.push(value);

        // Process children recursively and pass down disabled state
        if (hasChildren) {
          traverse(nodeChildren, value, disabled);
        }
      }
    });

    // Ordered children of parent
    if (parentValue !== undefined) {
      childrenOf.set(parentValue, siblingValues);
    } else {
      // ...and the root nodes
      rootValues.push(...siblingValues);
    }
  }

  traverse(children);

  return { nodes, rootValues, childrenOf };
}

function expandSelectionWithDescendants(
  selection: string[],
  model: TreeModel,
  disabledIds: Set<string>,
): string[] {
  const expanded = new Set(selection);

  function addDescendants(parentValue: string): void {
    const children = model.childrenOf.get(parentValue) ?? [];
    for (const child of children) {
      if (!disabledIds.has(child)) {
        expanded.add(child);
        addDescendants(child);
      }
    }
  }

  for (const value of selection) {
    addDescendants(value);
  }

  return Array.from(expanded);
}

function expandSelectionUpwards(
  selection: string[],
  model: TreeModel,
  disabledIds: Set<string>,
): string[] {
  const selectedSet = new Set(selection);

  for (const [value, meta] of model.nodes) {
    if (
      meta.hasChildren &&
      !selectedSet.has(value) &&
      !disabledIds.has(value)
    ) {
      const children = model.childrenOf.get(value) ?? [];
      const enabledChildren = children.filter((c) => !disabledIds.has(c));

      if (
        enabledChildren.length > 0 &&
        enabledChildren.every((c) => selectedSet.has(c))
      ) {
        selectedSet.add(value);
      }
    }
  }

  return Array.from(selectedSet);
}

export function useTree(props: UseTreeProps) {
  const {
    defaultExpanded = [],
    expanded: expandedProp,
    onExpandedChange,
    defaultSelected = [],
    selected: selectedProp,
    onSelectionChange,
    multiselect = false,
    disabled = false,
    children,
  } = props;

  const clampedDefaultSelected = multiselect
    ? defaultSelected
    : defaultSelected.slice(0, 1);

  const clampedSelectedProp =
    selectedProp && !multiselect ? selectedProp.slice(0, 1) : selectedProp;

  const treeModel = useMemo(() => buildTreeModel(children), [children]);

  const disabledIdsSet = useMemo(() => {
    const set = new Set<string>();
    for (const [value, meta] of treeModel.nodes) {
      if (meta.disabled) set.add(value);
    }
    return set;
  }, [treeModel]);

  const [expandedArray, setExpandedArray] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: "Tree",
    state: "expanded",
  });

  // Convert array to Set for more efficient lookups during rendering and nav
  const expandedState = useMemo(() => new Set(expandedArray), [expandedArray]);

  const expandedDefaultSelected = useMemo(() => {
    if (!multiselect || clampedDefaultSelected.length === 0) {
      return clampedDefaultSelected;
    }

    let expanded = expandSelectionWithDescendants(
      clampedDefaultSelected,
      treeModel,
      disabledIdsSet,
    );

    expanded = expandSelectionUpwards(expanded, treeModel, disabledIdsSet);

    return expanded;
  }, [clampedDefaultSelected, treeModel, disabledIdsSet, multiselect]);

  const [selectedState, setSelectedState] = useControlled({
    controlled: clampedSelectedProp,
    default: expandedDefaultSelected,
    name: "Tree",
    state: "selected",
  });

  const [indeterminateState, setIndeterminateState] = useState<Set<string>>(
    new Set(),
  );

  const [activeNode, setActiveNode] = useState<string | undefined>(undefined);

  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerElement = (value: string, element: HTMLElement) => {
    elementsRef.current.set(value, element);
    return () => {
      elementsRef.current.delete(value);
    };
  };

  const getElement = (value: string): HTMLElement | undefined => {
    return elementsRef.current.get(value);
  };

  const getNodeMeta = useCallback(
    (value: string): TreeNodeMeta | undefined => {
      return treeModel.nodes.get(value);
    },
    [treeModel],
  );

  const getParent = useCallback(
    (value: string): string | undefined => {
      return treeModel.nodes.get(value)?.parentValue;
    },
    [treeModel],
  );

  const getChildren = useCallback(
    (parentValue: string): string[] => {
      return treeModel.childrenOf.get(parentValue) ?? [];
    },
    [treeModel],
  );

  // Depth-first search (with pre-order traversal)
  const getDescendants = useCallback(
    (value: string): string[] => {
      const descendants: string[] = [];

      function traverse(parentValue: string): void {
        const children = treeModel.childrenOf.get(parentValue) ?? [];
        for (const child of children) {
          if (!disabledIdsSet.has(child)) {
            descendants.push(child);
            traverse(child);
          }
        }
      }

      traverse(value);
      return descendants;
    },
    [treeModel, disabledIdsSet],
  );

  const getAncestors = useCallback(
    (value: string): string[] => {
      const ancestors: string[] = [];
      let current = treeModel.nodes.get(value)?.parentValue;

      while (current) {
        ancestors.push(current);
        current = treeModel.nodes.get(current)?.parentValue;
      }

      return ancestors;
    },
    [treeModel],
  );

  const toggleExpanded = useCallback(
    (event: SyntheticEvent, value: string) => {
      const isExpanding = !expandedState.has(value);
      const newExpanded = isExpanding
        ? [...expandedArray, value]
        : expandedArray.filter((v) => v !== value);

      setExpandedArray(newExpanded);
      onExpandedChange?.(event, newExpanded);
    },
    [expandedArray, expandedState, onExpandedChange],
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
    if (multiselect) {
      const newIndeterminate = calculateIndeterminateState(selectedState);
      setIndeterminateState(newIndeterminate);
    }
  }, [multiselect, selectedState, calculateIndeterminateState]);

  const updateAncestors = (currentSelected: string[], value: string) => {
    let nextSelected = [...currentSelected];
    const nextSelectedSet = new Set(nextSelected);
    const ancestors = getAncestors(value);

    for (const ancestor of ancestors) {
      const children = treeModel.childrenOf.get(ancestor) ?? [];
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
  };

  const getMultiSelectState = (value: string) => {
    const isCurrentlySelected = selectedState.includes(value);
    let newSelected: string[];

    if (isCurrentlySelected) {
      newSelected = selectedState.filter((v) => v !== value);

      const descendants = getDescendants(value);
      newSelected = newSelected.filter((v) => !descendants.includes(v));
    } else {
      newSelected = [...selectedState, value];

      const descendants = getDescendants(value);
      const newDescendants = descendants.filter(
        (d) => !newSelected.includes(d),
      );
      newSelected = [...newSelected, ...newDescendants];
    }

    return updateAncestors(newSelected, value);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: getMultiSelectState/updateAncestors are intentionally not memoized - their captured values (selectedState, treeModel, etc.) are already in deps
  const select = useCallback(
    (event: SyntheticEvent, value: string) => {
      if (disabled || disabledIdsSet.has(value)) return;

      let newSelected: string[];

      if (multiselect) {
        newSelected = getMultiSelectState(value);
      } else {
        const isCurrentlySelected = selectedState.includes(value);
        newSelected = isCurrentlySelected ? [] : [value];
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
      calculateIndeterminateState,
      onSelectionChange,
    ],
  );

  // Visible nodes in depth-first order matching visual tree order
  const visibleNodes = useMemo((): string[] => {
    const visible: string[] = [];

    function traverse(values: string[]): void {
      for (const value of values) {
        visible.push(value);

        const nodeMeta = treeModel.nodes.get(value);
        if (nodeMeta?.hasChildren && expandedState.has(value)) {
          const children = treeModel.childrenOf.get(value) ?? [];
          traverse(children);
        }
      }
    }

    traverse(treeModel.rootValues);
    return visible;
  }, [treeModel, expandedState]);

  const tabbableNodeId = useMemo((): string | undefined => {
    if (activeNode) {
      return activeNode;
    }

    const selectedSet = new Set(selectedState);
    const firstSelectedVisible = visibleNodes.find((node) =>
      selectedSet.has(node),
    );

    if (firstSelectedVisible !== undefined) {
      return firstSelectedVisible;
    }

    return visibleNodes[0];
  }, [activeNode, selectedState, visibleNodes]);

  return {
    expandedArray,
    setExpandedArray,
    expandedState,
    toggleExpanded,
    selectedState,
    setSelectedState,
    select,
    multiselect,
    disabled,
    disabledIdsSet,
    treeModel,
    getNodeMeta,
    getParent,
    getChildren,
    getDescendants,
    getAncestors,
    visibleNodes,
    tabbableNodeId,
    registerElement,
    getElement,
    activeNode,
    setActiveNode,
    indeterminateState,
  };
}
