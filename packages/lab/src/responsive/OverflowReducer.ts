/**
 * This reducer manages a collection of items that represent the content of an overflowable container.
 * The items are mostly content configured by the caller of the container, either data passed though
 * the source prop or as child elements. We also support 'injected' items. These allow for additional UI
 * controls to be inserted into the container, eg an 'Add Item' button.
 */
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Reducer,
} from "react";

import type {
  InjectedChildItem,
  InjectedSourceItem,
  OverflowCollectionOptions,
  OverflowItem,
  OverflowItems,
  OverflowSource,
} from "./overflowTypes";

interface InitAction {
  type: "init";
  overflowItems?: OverflowItem[];
}

interface SourceAction {
  type: "add-source-item";
  idRoot: string;
  source: any;
}
interface AddChildAction {
  type: "add-child-item";
  idRoot: string;
  indexPosition?: number;
  element: ReactElement;
}
interface RemoveItemAction {
  type: "remove-item";
  indexPosition: number;
}

interface MultiItemAction {
  type: "update-items" | "update-items-remove-overflow-indicator";
  overflowItems: (Partial<Omit<OverflowItem, "id">> &
    Pick<OverflowItem, "id">)[];
}
interface SingleItemAction {
  type:
    | "add-overflow-indicator"
    | "replace-item"
    | "collapsing-item"
    | "uncollapse-dynamic-item"
    | "collapse-instant-item";

  overflowItem: OverflowItem;
}

interface CombinedItemAction {
  type: "update-items-add-overflow-indicator";
  overflowItem: OverflowItem<any>;
  overflowItems: OverflowItem[];
}

interface EmptyPayloadAction {
  type: "restore-collapsing-item";
}
interface DynamicCollapseAction extends Omit<SingleItemAction, "type"> {
  type: "collapse-dynamic-item";
  collapsedSize: number;
  minSize: number;
}

export type OverflowAction =
  | AddChildAction
  | CombinedItemAction
  | DynamicCollapseAction
  | EmptyPayloadAction
  | InitAction
  | MultiItemAction
  | RemoveItemAction
  | SingleItemAction
  | SourceAction;

const DEFAULT_PRIORITY = 3;

const mapReactElementChildren = (
  children: ReactNode,
  fn: (el: ReactElement, index: number) => OverflowItem,
): OverflowItem[] => {
  const childElements: OverflowItem[] = [];
  Children.forEach(children, (child, i) => {
    if (isValidElement(child)) {
      childElements.push(fn(child, i));
    }
  });
  return childElements;
};

const sourceItem = (
  item: OverflowSource,
  id: string,
  index: number,
  options?: OverflowCollectionOptions,
): OverflowItem<"source"> => {
  const priority =
    options?.getPriority?.(item, index) ?? item.priority ?? DEFAULT_PRIORITY;

  return {
    //TODO editable closeable configurable via item
    closeable: item.closeable || options?.closeable,
    editable: options?.editable,
    element: null,
    fullSize: null,
    id: item.id ?? id,
    index,
    label: item.label,
    position: item.position,
    priority,
    size: 0,
    source: item,
    type: "source",
  };
};

const createSourceItems = (
  source: any,
  idRoot: string,
  options?: OverflowCollectionOptions,
): OverflowItem<"source">[] | undefined => {
  if (Array.isArray(source)) {
    return source.map((item, index) => {
      const priority = options?.getPriority?.(source, index);
      return sourceItem(item, `${idRoot}-${index}`, index, options);
    });
  }
};

type OverflowChild = {
  closeable?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  "data-collapsible"?: boolean;
  "data-editable"?: boolean;
  "data-position"?: number;
  "data-priority"?: string;
};

const childItem = (
  child: ReactElement,
  id: string,
  index: number,
  options?: OverflowCollectionOptions,
): OverflowItem<"child"> => {
  const {
    closeable,
    disabled,
    id: idProp,
    label,
    "data-collapsible": collapsible,
    "data-editable": editable,
    "data-position": dataPosition,
    "data-priority": dataPriority = "2",
  } = child.props as OverflowChild;

  const priority = options?.getPriority?.(child, index);

  return {
    closeable: closeable || options?.closeable,
    collapsible,
    editable: editable ? true : options?.editable,
    disabled,
    fullSize: null,
    id: idProp ?? id,
    index,
    element: child,
    label,
    position: dataPosition,
    priority: priority ?? Number.parseInt(dataPriority),
    size: 0,
    source: null,
    type: "child",
  } as OverflowItem;
};

const createChildItems = (
  children: ReactNode,
  idRoot: string,
  options?: OverflowCollectionOptions,
): OverflowItem<"child">[] | undefined => {
  if (children) {
    return mapReactElementChildren(children, (child, index) => {
      const id = `${idRoot}-${index}`;
      return childItem(child, id, index, options);
    });
  }
};

const createInjectedContent = (
  items: Array<InjectedSourceItem | InjectedChildItem>,
  idRoot: string,
  startIndex: number,
): OverflowItem<"source" | "child">[] => {
  return items.map((item, i) => {
    const index = startIndex + i;
    const id = `${idRoot}-${index}`;
    const { source } = item as InjectedSourceItem;
    if (source) {
      const injectedItem = sourceItem(source, id, index);
      injectedItem.isInjectedItem = true;
      return injectedItem;
    }
    const { element } = item as InjectedChildItem;
    const injectedItem = childItem(element, id, index);
    injectedItem.isInjectedItem = true;
    return injectedItem;
  });
};

export type OverflowReducer = Reducer<OverflowItems, OverflowAction>;

const defaultOptions = {};

export type OverflowReducerInitialisationProps = {
  children?: ReactNode;
  source?: OverflowSource[];
  injectedItems?: any[];
  idRoot: string;
  options?: OverflowCollectionOptions;
};

export const reducerInitialiser: (
  props: OverflowReducerInitialisationProps,
) => OverflowItems = ({
  children,
  source,
  injectedItems = [],
  idRoot,
  options = defaultOptions,
}) => {
  const providedContent: OverflowItems =
    createChildItems(children, idRoot, options) ||
    createSourceItems(source, idRoot, options) ||
    [];
  const injectedContent = createInjectedContent(
    injectedItems,
    idRoot,
    providedContent.length,
  );
  return providedContent.concat(injectedContent);
};

const collapsingItem = (
  items: OverflowItem[],
  { overflowItem }: SingleItemAction,
) =>
  items.map((item) =>
    item === overflowItem
      ? {
          ...item,
          collapsing: true,
        }
      : item,
  );

const uncollapseDynamicItem = (
  items: OverflowItem[],
  { overflowItem }: SingleItemAction,
) =>
  items.map((item) =>
    item === overflowItem
      ? {
          ...item,
          collapsed: false,
          collapsing: true,
          size: item.fullSize as number,
          fullSize: null,
        }
      : item,
  );

const collapseInstantItem = (
  items: OverflowItem[],
  { overflowItem }: SingleItemAction,
) =>
  items.map((item) =>
    item === overflowItem
      ? {
          ...item,
          collapsed: true,
        }
      : item,
  );

const replaceItem = (
  items: OverflowItem[],
  { overflowItem }: SingleItemAction,
) =>
  items.map((item) =>
    item.index === overflowItem?.index ? overflowItem : item,
  );

const updateItems = (
  items: OverflowItem[],
  { overflowItems = [] }: MultiItemAction,
) => {
  return items.map((item) => {
    const targetItem = overflowItems.find((i) => i.id === item.id);
    return targetItem ? { ...item, ...targetItem } : item;
  });
};

const restoreCollapsingItem = (items: OverflowItem[]) => {
  const collapsingItem = items.find(
    ({ collapsible, collapsing }) => collapsible === "dynamic" && collapsing,
  );
  const collapsedItem = items.find(
    ({ collapsible, collapsed }) => collapsible === "dynamic" && collapsed,
  );
  return items.map((item) => {
    if (item === collapsingItem) {
      return {
        ...item,
        collapsing: false,
      };
    }
    if (item === collapsedItem) {
      return {
        ...item,
        collapsed: false,
        collapsing: true,
      };
    }
    return item;
  });
};

const collapseDynamicItem = (
  items: OverflowItem[],
  { overflowItem, collapsedSize = 0, minSize = 0 }: DynamicCollapseAction,
) => {
  const remainingUncollpasedItems = items.filter(
    (i) => i.collapsible === "dynamic" && !i.collapsed && i !== overflowItem,
  );
  const lastUncollapsedItem = remainingUncollpasedItems.pop();

  return items.map((item) => {
    if (item === overflowItem) {
      return {
        ...item,
        collapsing: false,
        collapsed: true,
        fullSize: item.size,
        minSize,
        size: collapsedSize,
      };
    }
    if (item === lastUncollapsedItem) {
      return {
        ...item,
        collapsing: true,
      };
    }
    return item;
  });
};

const addSourceItem = (
  items: OverflowItem<any>[],
  { idRoot, source }: SourceAction,
): OverflowItem[] => {
  const index = items.length;
  return items.concat(sourceItem(source, `${idRoot}-${index}`, index));
};

const removeItem = (
  items: OverflowItem<any>[],
  { indexPosition }: RemoveItemAction,
): OverflowItem[] => {
  return items.slice(0, indexPosition).concat(items.slice(indexPosition + 1));
};

const addOverflowIndicator = (
  items: OverflowItem<any>[],
  { overflowItem }: SingleItemAction,
) => {
  // Guard against accidental duplicate overflowIndicator
  if (!items.find((i) => i.isOverflowIndicator)) {
    if (items.find((i) => i.label === "Add Tab")) {
      const [addTab] = items.slice(-1);
      return items
        .slice(0, -1)
        .concat({ ...overflowItem, index: addTab.index })
        .concat({ ...addTab, index: overflowItem.index });
    }
    return items.concat(overflowItem);
  }
  return items;
};

export const overflowReducer: OverflowReducer = (state, action) => {
  switch (action.type) {
    case "init":
      return action.overflowItems ?? state;
    case "add-overflow-indicator":
      return addOverflowIndicator(state, action);

    case "update-items":
      return updateItems(state, action);

    case "replace-item":
      return replaceItem(state, action);

    case "update-items-add-overflow-indicator":
      return addOverflowIndicator(
        updateItems(state, {
          type: "update-items",
          overflowItems: action.overflowItems,
        }),
        { type: "add-overflow-indicator", overflowItem: action.overflowItem },
      );

    case "update-items-remove-overflow-indicator":
      return updateItems(state, {
        type: "update-items",
        overflowItems: action.overflowItems,
      }).filter((item) => !item.isOverflowIndicator);

    case "collapsing-item":
      return collapsingItem(state, action);

    case "collapse-dynamic-item":
      return collapseDynamicItem(state, action);

    case "uncollapse-dynamic-item":
      return uncollapseDynamicItem(state, action);

    case "restore-collapsing-item":
      return restoreCollapsingItem(state);

    case "collapse-instant-item":
      return collapseInstantItem(state, action);

    case "add-source-item":
      return addSourceItem(state, action);

    case "remove-item":
      return removeItem(state, action);

    default:
      return state;
  }
};
