import { TooltipContext, useForkRef } from "@jpmorganchase/uitk-core";
import {
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  ReactElement,
  useContext,
  useRef,
} from "react";
import {
  DescendantContext,
  DescendantProvider,
} from "./internal/DescendantContext";
import { ListBase, ListScrollHandles } from "./ListBase";
import { ListProps, ListSelectionVariant } from "./ListProps";
import { ListStateContext } from "./ListStateContext";
import { useList } from "./useList";
import { useTypeSelect } from "./useTypeSelect";

const ListWithDescendants = forwardRef(function ListWithDescendants<
  Item,
  Variant extends ListSelectionVariant
>(
  props: ListProps<Item, Variant>,
  ref?: ForwardedRef<ListScrollHandles<Item>>
) {
  const { items } = useContext(DescendantContext);

  const { focusedRef, state, helpers, listProps } = useList({
    source: items.current.length ? items.current : [],
    ...props,
  });

  const { highlightedIndex } = state;
  const { setHighlightedIndex, setFocusVisible } = helpers;

  const {
    disabled,
    disableTypeToSelect,
    getItemAtIndex,
    itemCount,
    itemToString,
    onKeyDownCapture: onListKeyDownCapture,
    ...restListProps
  } = listProps;

  const { onKeyDownCapture: onTypeSelectKeyDownCapture } = useTypeSelect({
    getItemAtIndex,
    highlightedIndex,
    itemCount,
    itemToString,
    setFocusVisible,
    setHighlightedIndex,
  });

  const setListRef = useForkRef(focusedRef, props.listRef);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    if (onListKeyDownCapture) {
      onListKeyDownCapture(event);
    }

    if (!disableTypeToSelect && onTypeSelectKeyDownCapture) {
      onTypeSelectKeyDownCapture(event);
    }
  };

  return (
    <ListStateContext.Provider value={{ state, helpers }}>
      <ListBase
        listRef={setListRef}
        ref={ref}
        {...restListProps}
        disabled={disabled}
        getItemAtIndex={getItemAtIndex}
        itemCount={itemCount}
        itemToString={itemToString}
        onKeyDownCapture={handleKeyDownCapture}
      />
    </ListStateContext.Provider>
  );
}) as <Item, Variant extends ListSelectionVariant>(
  props: ListProps<Item, Variant> & {
    ref?: ForwardedRef<ListScrollHandles<Item>>;
  }
) => ReactElement<ListProps<Item, Variant>>;

export const List = forwardRef(function List<
  Item,
  Variant extends ListSelectionVariant
>(
  props: ListProps<Item, Variant>,
  ref?: ForwardedRef<ListScrollHandles<Item>>
) {
  const {
    Tooltip,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    tooltipPlacement,
    ...restProps
  } = props;

  const itemsRef = useRef([]);

  return (
    <TooltipContext.Provider
      value={{
        Tooltip,
        enterDelay: tooltipEnterDelay,
        leaveDelay: tooltipLeaveDelay,
        placement: tooltipPlacement,
      }}
    >
      <DescendantProvider items={itemsRef}>
        <ListWithDescendants<Item, Variant> ref={ref} {...restProps} />
      </DescendantProvider>
    </TooltipContext.Provider>
  );
}) as <Item = string, Variant extends ListSelectionVariant = "default">(
  props: ListProps<Item, Variant> & {
    ref?: ForwardedRef<ListScrollHandles<Item>>;
  }
) => ReactElement<ListProps<Item, Variant>>;
