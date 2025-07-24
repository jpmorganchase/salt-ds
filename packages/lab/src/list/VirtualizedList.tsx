import { makePrefixer, useForkRef, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  useRef,
} from "react";
import {
  type CollectionIndexer,
  isSelected,
  type SelectionStrategy,
  useCollectionItems,
  useImperativeScrollingAPI,
} from "../common-hooks";
import listCss from "./List.css";
import { ListItem, ListItemProxy } from "./ListItem";
import type { ListProps } from "./listTypes";
import { useList } from "./useList";
import { useListHeight } from "./useListHeight";
import { type Row, useVirtualization } from "./useVirtualization";

const defaultEmptyMessage = "No data to display";

const withBaseName = makePrefixer("saltList");

export const VirtualizedList = forwardRef(function List<
  Item,
  Selection extends SelectionStrategy = "default",
>(
  {
    borderless,
    children,
    className,
    collapsibleHeaders = false,
    defaultHighlightedIndex: defaultHighlightedIdx,
    defaultSelected,
    disabled: listDisabled = false,
    disableFocus = false,
    disableTypeToSelect,
    displayedItemCount = 10,
    emptyMessage,
    getItemHeight,
    getItemId,
    height,
    highlightedIndex: highlightedIdxProp,
    id: idProp,
    itemGapSize = 0,
    itemHeight: itemHeightProp,
    itemTextHighlightPattern,
    itemToString,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: selectedProp,
    selectionStrategy,
    scrollingApiRef,
    // TODO do we still need these ?
    selectionKeys,
    showEmptyMessage = false,
    source,
    style: styleProp,
    stickyHeaders,
    tabToSelect,
    width,
    ...htmlAttributes
  }: ListProps<Item, Selection>,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list",
    css: listCss,
    window: targetWindow,
  });

  const id = useIdMemo(idProp);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowHeightProxyRef = useRef<HTMLDivElement | null>(null);

  const collectionHook = useCollectionItems<Item>({
    id,
    label: "List",
    source,
    children,
    options: {
      collapsibleHeaders,
      getItemId,
      itemToString,
    },
  });

  const { preferredHeight } = useListHeight({
    borderless,
    displayedItemCount,
    height,
    itemCount: collectionHook.data.length,
    itemGapSize,
    itemHeight: itemHeightProp,
    rowHeightRef: rowHeightProxyRef,
  });
  const {
    focusVisible,
    highlightedIndex,
    listControlProps,
    listHandlers,
    scrollIntoView,
    selected,
  } = useList<Item, Selection>({
    collapsibleHeaders,
    collectionHook,
    containerRef: rootRef,
    defaultHighlightedIndex: defaultHighlightedIdx,
    defaultSelected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(defaultSelected),
    disabled: listDisabled,
    disableTypeToSelect,
    highlightedIndex: highlightedIdxProp,
    label: id,
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(selectedProp),
    selectionStrategy,
    selectionKeys,
    stickyHeaders,
    tabToSelect,
  });

  // TODO move into useList
  const {
    rows: data,
    contentHeight,
    onVerticalScroll: onScroll,
  } = useVirtualization<Item>({
    viewportRef: rootRef,
    data: collectionHook.data,
    itemGapSize,
  });

  // FIXME: useImperativeScrollingAPI doesn't work when element is not rendered beyond `renderBuffer`
  // One potential way: pass `scrollIntoView` to `useVirtualization` and update rows before original `scrollIntoView` been called
  useImperativeScrollingAPI({
    collectionHook,
    forwardedRef: scrollingApiRef,
    scrollableRef: rootRef,
    scrollIntoView,
  });

  function addItem(
    list: ReactElement[],
    row: Row<Item>,
    idx: { value: number },
  ) {
    const [key, offset, pos, item] = row;
    const index = pos - 1;
    list.push(
      <ListItem
        aria-setsize={collectionHook.data.length}
        aria-posinset={pos}
        className={clsx(className, {
          saltHighlighted: index === highlightedIndex,
          saltFocusVisible: focusVisible === index,
        })}
        data-idx={index}
        key={key}
        data-offset={offset}
        role="option"
        selected={isSelected<Item>(selected, item)}
        id={item.id}
        style={{
          transform: `translate3d(0px, ${offset}px, 0px)`,
        }}
      >
        {item.label}
      </ListItem>,
    );
    idx.value += 1;
  }

  function renderItems(
    data: Row<Item>[],
    idx: CollectionIndexer = { value: 0 },
    end = data.length,
  ) {
    const listItems: ReactElement[] = [];
    while (idx.value < end) {
      const item = data[idx.value];
      addItem(listItems, item, idx);
    }
    return listItems;
  }

  function renderEmpty() {
    if (emptyMessage || showEmptyMessage) {
      return (
        <span className={withBaseName("empty-message")}>
          {emptyMessage ?? defaultEmptyMessage}
        </span>
      );
    }
    return null;
  }

  const renderContent = () => {
    if (data.length) {
      return renderItems(data);
    }
    renderEmpty();
  };

  const sizeStyles = {
    "--list-item-gap": itemGapSize ? `${itemGapSize}px` : undefined,
    minWidth,
    minHeight,
    width: width ?? "100%",
    height: height ?? "100%",
    maxWidth: maxWidth ?? width,
    maxHeight: maxHeight ?? preferredHeight,
  };
  return (
    <div
      {...htmlAttributes}
      {...listHandlers}
      {...listControlProps}
      className={clsx(withBaseName(), className, withBaseName("virtualized"))}
      id={`${id}`}
      ref={useForkRef<HTMLDivElement>(rootRef, forwardedRef)}
      role="listbox"
      onScroll={onScroll}
      style={{ ...styleProp, ...sizeStyles }}
      tabIndex={listDisabled || disableFocus ? undefined : 0}
    >
      <div
        className={withBaseName("scrollingContentContainer")}
        style={{ height: contentHeight }}
      >
        <ListItemProxy ref={rowHeightProxyRef} />
        {renderContent()}
      </div>
    </div>
  );
}) as <Item = string, Selection extends SelectionStrategy = "default">(
  props: ListProps<Item, Selection> & {
    ref?: ForwardedRef<HTMLDivElement>;
  },
) => ReactElement<ListProps<Item, Selection>>;
