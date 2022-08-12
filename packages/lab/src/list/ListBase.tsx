import {
  makePrefixer,
  useCharacteristic,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import {
  Children,
  ComponentType,
  createContext,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  memo,
  ReactElement,
  Ref,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { areEqual, FixedSizeList, VariableSizeList } from "react-window";
import { calcPreferredListHeight } from "./internal/calcPreferredListHeight";
import { scrollIntoView } from "./internal/scrollIntoView";
import { useListAutoSizer } from "./internal/useListAutoSizer";
import { itemToString as defaultItemToString } from "./itemToString";
import { ListItemBase } from "./ListItemBase";
import { ListItemContext } from "./ListItemContext";
import { ListBaseProps } from "./ListProps";
import { useListStateContext } from "./ListStateContext";
import { useListItem, useVirtualizedListItem } from "./useListItem";

import "./List.css";

const withBaseName = makePrefixer("uitkList");

export interface ListboxContextProps<Item> {
  borderless?: boolean;
  className?: string;
  disabled?: boolean;
  disableFocus?: boolean;
  getItemId?: (index: number) => string;
  getItemHeight?: (index?: number) => number;
  id?: string;
  itemToString?: (item: Item) => string;
  listRef?: Ref<any>;
  style?: any;
  onScroll?: (evt: any) => void;
}

const ListboxContext = createContext<ListboxContextProps<any>>({});
const DefaultItem = memo(function DefaultItem(props: any) {
  const { item, itemToString, itemProps } = useListItem(props);
  return <ListItemBase {...itemProps}>{itemToString(item)}</ListItemBase>;
}, areEqual);

const DefaultVirtualizedItem = memo(function DefaultVirtualizedItem(
  props: any
) {
  const { item, itemToString, itemProps } = useVirtualizedListItem(props);
  return <ListItemBase {...itemProps}>{itemToString(item)}</ListItemBase>;
},
areEqual);

export interface ListboxProps extends HTMLAttributes<HTMLDivElement> {
  onScroll?: (evt: any) => void;
}

/**
 * Listbox is the container for all list items. It is used as `outerElement` for
 * `react-window`.
 *
 * forwardRef gives `react-window` a way to attach a ref to listen to "scroll" events.
 * And `onScroll` is added by `react-window` so we pass it on.
 */
const Listbox: ComponentType<ListboxProps> = forwardRef(function Listbox(
  props,
  ref
) {
  const { style, onScroll, children } = props;

  const {
    className,
    borderless,
    disabled,
    disableFocus,
    listRef,
    style: styleProp,
    onScroll: onScrollProp,
    ...restListProps
  } = useContext<ListboxContextProps<any>>(ListboxContext);

  const setListRef = useForkRef(ref, listRef);

  const handleScroll = (event: any) => {
    if (onScroll) {
      onScroll(event);
    }

    if (onScrollProp) {
      onScrollProp(event);
    }
  };

  return (
    <div
      className={classnames(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      onScroll={handleScroll}
      ref={setListRef}
      style={{ ...style, ...styleProp }}
      tabIndex={disabled || disableFocus ? undefined : 0}
      {...restListProps}
    >
      {children}
    </div>
  );
});

export interface ListScrollHandles<Item> {
  scrollToIndex: (itemIndex: number) => void;
  scrollToItem: (item: Item) => void;
  scrollTo: (scrollOffset: number) => void;
}

const noScrolling: ListScrollHandles<unknown> = {
  scrollToIndex: (itemIndex: number) => undefined,
  scrollToItem: (item) => undefined,
  scrollTo: (scrollOffset: number) => undefined,
};

export const ListBase = forwardRef(function ListBase<Item>(
  props: ListBaseProps<Item>,
  ref: ForwardedRef<ListScrollHandles<Item>>
) {
  const { state } = useListStateContext();

  // Getting list id in the following order:
  // 1. Use the id prop if it's defined, otherwise..
  // 2. Use the id from list context if it's defined, or finally...
  // 3. Generate a random id.
  const generatedId = useId(props.id);
  const defaultId = state.id ?? generatedId;

  const sizeStackable = useCharacteristic("size", "stackable");
  const defaultItemHeight =
    sizeStackable === null ? 36 : parseInt(sizeStackable, 10);

  const hasIndexer = typeof props.getItemAtIndex === "function";
  const hasVariableHeight = typeof props.getItemHeight === "function";

  const {
    id = defaultId,
    source = [],
    borderless,
    children,
    disableMouseDown,
    itemTextHighlightPattern,
    itemCount = source.length,
    itemToString = defaultItemToString,
    // TODO: Read from css variable
    itemGapSize = 1,
    itemHeight = defaultItemHeight,
    getItemHeight = () => itemHeight,
    getItemId = (index) => `${id}-item-${index}`,
    getItemIndex = (item) => source.indexOf(item),
    getItemAtIndex,
    overscanCount = 10,
    displayedItemCount = 10,
    virtualized,
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    ListPlaceholder,
    ListItem = virtualized ? DefaultVirtualizedItem : DefaultItem,
    listRef: listRefProp,
    ...restProps
  } = props;

  const { highlightedIndex } = state;

  const preferredHeight =
    height ??
    calcPreferredListHeight({
      borderless,
      displayedItemCount,
      itemCount,
      itemHeight,
      getItemHeight,
      itemGapSize,
    });

  const [containerRef, autoSize] = useListAutoSizer<HTMLDivElement>({
    responsive: width === undefined || height === undefined,
    height: preferredHeight,
    width,
  });

  /**
   * This is used to access `react-window` API
   * @see https://react-window.now.sh/#/api/FixedSizeList (under `Methods`)
   */
  const virtualizedListRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const setListRef = useForkRef(listRef, listRefProp);

  const scrollToIndex = (itemIndex: number) => {
    scrollIntoView(
      listRef.current?.querySelector(`[data-option-index="${itemIndex}"]`),
      listRef
    );
  };

  const scrollHandles: ListScrollHandles<Item> = useMemo(
    () => ({
      scrollToIndex,
      scrollToItem: (item: Item) => {
        scrollToIndex(getItemIndex(item));
      },
      scrollTo: (scrollOffset: number) => {
        if (listRef.current) {
          listRef.current.scrollTop = scrollOffset;
        }
      },
    }),
    [getItemIndex]
  );

  const virtualizedScrollHandles: ListScrollHandles<Item> = useMemo(
    () => ({
      scrollToIndex: (itemIndex: number) => {
        if (virtualizedListRef.current) {
          virtualizedListRef.current.scrollToItem(itemIndex);
        }
      },
      scrollToItem: (item: Item) => {
        virtualizedListRef.current.scrollToItem(getItemIndex(item));
      },
      scrollTo: (scrollOffset: number) => {
        virtualizedListRef.current.scrollTo(scrollOffset);
      },
    }),
    [getItemIndex]
  );

  useImperativeHandle(
    ref,
    () => {
      if (virtualized && virtualizedListRef.current) {
        return virtualizedScrollHandles;
      } else if (listRef.current) {
        return scrollHandles;
      } else {
        return noScrolling;
      }
    },
    [virtualized, scrollHandles, virtualizedScrollHandles]
  );

  useIsomorphicLayoutEffect(() => {
    if (highlightedIndex == null) {
      return;
    }

    if (virtualized && virtualizedListRef.current) {
      virtualizedListRef.current.scrollToItem(highlightedIndex);
    } else if (listRef.current) {
      scrollToIndex(highlightedIndex);
    }
  }, [highlightedIndex, virtualized]);

  const renderList = () => {
    if (Children.count(children)) {
      return (
        <Listbox style={autoSize}>
          <ListItemContext.Provider
            value={{
              disableMouseDown,
              getItemId,
              getItemHeight,
              //@ts-ignore
              itemToString,
              itemTextHighlightPattern,
            }}
          >
            {children}
          </ListItemContext.Provider>
        </Listbox>
      );
    }

    if (virtualized) {
      const VirtualizedList: any = hasVariableHeight
        ? VariableSizeList
        : FixedSizeList;

      return (
        <ListItemContext.Provider
          value={{
            disableMouseDown,
            getItemId,
            //@ts-ignore
            itemToString,
            itemTextHighlightPattern,
          }}
        >
          <VirtualizedList
            height={autoSize.height}
            itemCount={itemCount}
            itemData={source}
            itemSize={hasVariableHeight ? getItemHeight : itemHeight}
            outerElementType={Listbox}
            overscanCount={overscanCount}
            ref={virtualizedListRef}
            width={autoSize.width}
          >
            {ListItem}
          </VirtualizedList>
        </ListItemContext.Provider>
      );
    }

    return (
      <Listbox style={autoSize}>
        <ListItemContext.Provider
          value={{
            disableMouseDown,
            getItemId,
            getItemHeight,
            //@ts-ignore
            itemToString,
            itemTextHighlightPattern,
          }}
        >
          {(hasIndexer ? Array.from({ length: itemCount }) : source).map(
            (item, index) => (
              <ListItem
                index={index}
                // No, getItemAtIndex can NOT be undefined, because hasIndexer is confirming that already. stupid stupid typescript !!!
                item={hasIndexer ? getItemAtIndex!(index) : item}
                key={getItemId(index)}
              />
            )
          )}
        </ListItemContext.Provider>
      </Listbox>
    );
  };

  // TODO It's weird that List itself isn't the root element, ListWrapper is
  // THat means if client passes style, with margin, for example, it will break;
  return (
    <div
      className={classnames(withBaseName("wrapper"), {
        [withBaseName("borderless")]: borderless,
      })}
      ref={containerRef}
      style={{
        minWidth,
        minHeight,
        width: width ?? "100%",
        height: height ?? "100%",
        maxWidth: maxWidth ?? width,
        maxHeight: maxHeight ?? preferredHeight,
      }}
    >
      {itemCount === 0 && ListPlaceholder !== undefined ? (
        <ListPlaceholder style={autoSize} />
      ) : (
        <ListboxContext.Provider
          value={{
            ...restProps,
            listRef: setListRef,
            id,
            borderless,
          }}
        >
          {renderList()}
        </ListboxContext.Provider>
      )}
    </div>
  );
}) as <Item>(
  p: ListBaseProps<Item> & { ref?: ForwardedRef<ListScrollHandles<Item>> }
) => ReactElement<ListBaseProps<Item>>;
