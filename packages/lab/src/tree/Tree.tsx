import { makePrefixer, useForkRef, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useRef,
} from "react";
import {
  type CollectionIndexer,
  type CollectionItem,
  calcPreferredHeight,
  closestListItemIndex,
  GROUP_SELECTION_NONE,
  isSelected,
  type SelectHandler,
  type SelectionChangeHandler,
  type SelectionStrategy,
  type SingleSelectionStrategy,
  useAutoSizer,
  useCollectionItems,
} from "../common-hooks";
import treeCss from "./Tree.css";
import { TreeNode } from "./TreeNode";
import type { TreeProps } from "./treeTypes";
import { useTree } from "./useTree";

const withBaseName = makePrefixer("saltTree");

const getSelectedItemsFromSource = (
  source: any[],
  selectionStrategy: SelectionStrategy,
  result: any[] = [],
) => {
  const isSingleSelection =
    selectionStrategy === "default" || selectionStrategy === "deselectable";
  for (const item of source) {
    if (item.selected === true) {
      result.push(item);
      if (isSingleSelection) {
        break;
      }
    }
    if (item.childNodes) {
      getSelectedItemsFromSource(item.childNodes, selectionStrategy, result);
      if (isSingleSelection && result.length === 1) {
        break;
      }
    }
  }

  return isSingleSelection ? result[0] : result.length > 0 ? result : undefined;
};

export const Tree = forwardRef(function Tree<
  Item,
  Selection extends SelectionStrategy = "deselectable",
>(
  {
    className,
    defaultSelected,
    disabled,
    groupSelection = GROUP_SELECTION_NONE,
    height,
    id: idProp,
    onHighlight,
    onToggle,
    onSelect,
    onSelectionChange,
    revealSelected,
    selected: selectedProp,
    selectionStrategy,
    source,
    style: styleProp,
    width,
    ...htmlAttributes
  }: TreeProps<Item, Selection>,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree",
    css: treeCss,
    window: targetWindow,
  });

  const id = useIdMemo(idProp);
  const rootRef = useRef(null);
  const contentRef = useRef(null);

  const collectionHook = useCollectionItems<Item>({
    id,
    source,
    options: {
      noChildrenLabel: "No children available",
      revealSelected: revealSelected
        ? Boolean(selectedProp) || Boolean(defaultSelected) || false
        : undefined,
    },
  });

  //------------- from original List
  const preferredHeight =
    height ??
    calcPreferredHeight({
      displayedItemCount: 10,
      itemCount: collectionHook.data.length,
      itemHeight: 36,
      // getItemHeight,
      // itemGapSize,
    });

  const autoSize = useAutoSizer<HTMLDivElement>({
    containerRef: rootRef,
    responsive: width === undefined || height === undefined,
    height: preferredHeight,
    width,
  });
  //---------------

  const handleSelect = useCallback<SelectHandler<CollectionItem<Item>>>(
    (evt, selectedItem) => {
      if (onSelect) {
        if (isValidElement(selectedItem.value)) {
          onSelect(evt, selectedItem.label as any);
        } else if (selectedItem.value !== null) {
          onSelect(evt, selectedItem.value);
        }
      }
    },
    [onSelect],
  );

  const handleSelectionChange = useCallback<
    SelectionChangeHandler<CollectionItem<Item>, Selection>
  >(
    (evt, selected) => {
      type returnType = Selection extends SingleSelectionStrategy
        ? Item | null
        : Item[];
      if (onSelectionChange) {
        onSelectionChange(
          evt,
          Array.isArray(selected)
            ? (selected.map((s) => s.value) as returnType)
            : selected && (selected.value as returnType),
        );
      }
    },
    [onSelectionChange],
  );

  // const getSelected = (
  //   sel: Item | null | Item[]
  // ):
  //   | undefined
  //   | (Selection extends SingleSelectionStrategy
  //       ? CollectionItem<Item> | null
  //       : CollectionItem<Item>[]) => {
  //   if (sel !== undefined) {
  //     return collectionHook.itemToCollectionItem<Selection, typeof sel>(sel);
  //   } else if (Array.isArray(source)) {
  //     const selected = getSelectedItemsFromSource(
  //       source,
  //       selectionStrategy ?? "default"
  //     );
  //     return Array.isArray(selected)
  //       ? collectionHook.itemToCollectionItem(selected)
  //       : selected
  //       ? collectionHook.toCollectionItem(selected)
  //       : undefined;
  //   }
  // };

  const {
    focusVisible,
    highlightedIdx,
    highlightItemAtIndex,
    listHandlers,
    listProps,
    listItemHandlers,
    selected,
  } = useTree<Item, Selection>({
    collectionHook,
    containerRef: rootRef,
    contentRef,
    // Note this isn't enough for a Tree, because of nested structure
    defaultSelected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(defaultSelected),
    disabled,
    groupSelection,
    onHighlight,
    onSelect: handleSelect,
    onSelectionChange: handleSelectionChange,
    onToggle,
    selected: collectionHook.itemToCollectionItem<
      Selection,
      typeof selectedProp
    >(selectedProp),
    selectionStrategy,
  });

  // TODO move into useTree (see useList)
  const defaultItemHandlers = {
    onMouseEnter: (evt: MouseEvent) => {
      // if (!isScrolling.current) {
      const idx = closestListItemIndex(evt.target as HTMLElement);
      if (idx != null) {
        highlightItemAtIndex(idx);
      }
      // onMouseEnterListItem && onMouseEnterListItem(evt, idx);
      // }
    },
  };

  const propsCommonToAllListItems = {
    ...defaultItemHandlers,
    ...listItemHandlers,
    isLeaf: true,
    role: "treeitem",
  };
  // const allowGroupSelect = groupSelectionEnabled(groupSelection);
  const allowGroupSelect = false;

  /**
   * Add a ListItem from source item
   */
  function addLeafNode(
    list: ReactElement[],
    item: CollectionItem<Item>,
    idx: CollectionIndexer,
  ) {
    const itemProps = {
      "aria-disabled": disabled || item.disabled,
      "aria-level": item.level,
      "data-idx": idx.value,
      description: item.description,
      id: item.id,
      key: item.id,
      highlighted: idx.value === highlightedIdx || undefined,
      selected: isSelected<Item>(selected, item),
      className: clsx({
        focusVisible: focusVisible === idx.value,
      }),
    };

    list.push(
      <TreeNode
        {...propsCommonToAllListItems}
        {...itemProps}
        label={item.label}
      >
        {/* {item.icon ? <span className={`${classBase}Node-icon`} /> : null} */}
      </TreeNode>,
    );
    idx.value += 1;
  }

  function addGroupNode(
    list: ReactElement[],
    items: CollectionItem<Item>[],
    idx: CollectionIndexer,
    id: string,
    title: string,
  ) {
    const { value: i } = idx;
    const item = items[i];
    idx.value += 1;
    list.push(
      <TreeNode
        {...defaultItemHandlers}
        {...listItemHandlers}
        aria-disabled={disabled || item.disabled}
        aria-expanded={item.expanded}
        aria-level={item.level}
        className={clsx({
          focusVisible: focusVisible === i,
          [withBaseName("toggle")]: !allowGroupSelect,
        })}
        // data-icon={child.icon}
        data-idx={i}
        data-selectable
        description={item.description}
        highlighted={i === highlightedIdx}
        id={id}
        key={`header-${i}`}
        label={title}
        selected={isSelected<Item>(selected, item)}
      >
        {item.expanded ? (
          <ul className={withBaseName("child-nodes")} role="group">
            {renderItems(items, idx, (item.level ?? 0) + 1)}
          </ul>
        ) : null}
      </TreeNode>,
    );
  }

  const renderItems = (
    items: CollectionItem<Item>[],
    idx: CollectionIndexer = { value: 0 },
    level = 1,
  ): ReactElement[] => {
    const listItems: ReactElement[] = [];
    while (idx.value < items.length) {
      const item = items[idx.value];
      if (item.level != null && item.level < level) {
        break;
      }
      if (item.childNodes != null && item.id != null && item.label != null) {
        addGroupNode(listItems, items, idx, item.id, item.label);
      } else {
        addLeafNode(listItems, item, idx);
      }
    }

    return listItems;
  };

  function renderEmpty() {
    // if (emptyMessage || showEmptyMessage) {
    //   return (
    //     <span className={withBaseName("empty-message")}>
    //       {emptyMessage ?? defaultEmptyMessage}
    //     </span>
    //   );
    // } else {
    return null;
    // }
  }

  const renderContent = () => {
    if (collectionHook.data.length) {
      return renderItems(collectionHook.data);
    }
    renderEmpty();
  };

  return (
    <div
      {...htmlAttributes}
      {...listHandlers}
      {...listProps}
      className={clsx(withBaseName(), className)}
      id={`Tree-${id}`}
      ref={useForkRef(rootRef, forwardedRef)}
      style={{ ...styleProp, ...autoSize }}
      tabIndex={0}
    >
      <ul
        className={withBaseName("scrollingContentContainer")}
        ref={contentRef}
        role="tree"
        // style={{ height: contentHeight }}
      >
        {renderContent()}
      </ul>
    </div>
  );
});
