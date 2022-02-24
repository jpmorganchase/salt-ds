import {
  HTMLAttributes,
  ReactNode,
  Ref,
  RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAriaAnnouncer } from "@brandname/core";

import { useComboBox } from "./useComboBox";
import { getAnnouncement } from "./getAnnouncement";
import { GetFilterRegex } from "../filterHelpers";
import {
  ListBase,
  ListProps,
  ListSelectionVariant,
  ListStateContext,
} from "../../list";
import { Popper, PopperProps, usePopperListAdapter } from "../../popper";
import { Input, InputProps } from "../../input";
import { useForkRef } from "../../utils";
import { TooltipContext, TooltipContextProps } from "../../tooltip";

export type BaseComboBoxProps<
  Item,
  Variant extends ListSelectionVariant = "default"
> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "onSelect" | "onFocus" | "onBlur" | "onClick"
> &
  Pick<
    ListProps<Item, Variant>,
    | "displayedItemCount"
    | "itemToString"
    | "listRef"
    | "onChange"
    | "onSelect"
    | "overscanCount"
    | "source"
    | "tooltipEnterDelay"
    | "tooltipLeaveDelay"
    | "tooltipPlacement"
    | "virtualized"
    | "width"
  > & {
    ListItem?: ReactNode;
    ListProps?: Partial<ListProps<Item, Variant>>;
    PopperProps?: Partial<PopperProps>;
    Tooltip?: TooltipContextProps["Tooltip"];
    allowFreeText?: boolean;
    disabled?: boolean;
    getFilterRegex?: GetFilterRegex;
    initialOpen?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    inputValue?: string;
    listWidth?: number | string;

    rootWidth?: string | number;
    rootRef: RefObject<HTMLElement>;
    disabledPortal?: boolean;
    source: Item[];
  };

export interface DefaultComboBoxProps<Item>
  extends BaseComboBoxProps<Item>,
    Pick<InputProps, "onFocus" | "onBlur"> {
  InputProps?: InputProps;
  initialSelectedItem?: Item;
  multiSelect?: false;
  onInputFocus?: InputProps["onFocus"];
  onInputBlur?: InputProps["onBlur"];
  onInputChange?: InputProps["onChange"];
  onInputSelect?: InputProps["onSelect"];
  stringToItem?: (value?: string) => Item | null | undefined;
}

export function DefaultComboBox<Item>(
  props: DefaultComboBoxProps<Item>
): ReactNode {
  const {
    ListItem,
    Tooltip,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    tooltipPlacement,
    rootRef,
    listRef: listRefProp,
    inputRef: inputRefProp,
    rootWidth,
    listWidth,
    PopperProps: popperProps,
    ...restProps
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef(null);

  const setInputRef = useForkRef(inputRef, inputRefProp);
  // Use callback ref as listRef could be null when it's closed
  const setListRef = useForkRef(listRef, listRefProp);

  const { announce } = useAriaAnnouncer({ debounce: 1000 });

  const tooltipContext = useMemo(
    () => ({
      Tooltip,
      enterDelay: tooltipEnterDelay,
      leaveDelay: tooltipLeaveDelay,
      placement: tooltipPlacement,
    }),
    [Tooltip, tooltipEnterDelay, tooltipLeaveDelay, tooltipPlacement]
  );

  const {
    inputRef: setHookInputRef,
    listContext,
    inputProps,
    listProps,
  } = useComboBox(restProps);

  const { allowAnnouncement, disabled, value, ...restInputProps } = inputProps;
  const { isListOpen, itemCount, itemToString, source, ...restListProps } =
    listProps;

  const firstItem = null;

  const allowAnnouncementRef = useRef(allowAnnouncement);
  useEffect(() => {
    allowAnnouncementRef.current = allowAnnouncement;
  }, [allowAnnouncement]);

  useEffect(() => {
    if (allowAnnouncementRef.current && value && firstItem) {
      announce(getAnnouncement(itemCount, firstItem));
    }
  }, [firstItem, value, itemCount, announce]);

  const [reference, floating, popperPosition, maxListHeight] =
    usePopperListAdapter(isListOpen);

  useEffect(() => {
    if (rootRef.current) {
      reference(rootRef.current);
    }
  }, [rootRef]);

  return (
    <>
      <Input
        disabled={disabled}
        ref={useForkRef(setInputRef, setHookInputRef)}
        value={value}
        {...restInputProps}
      />
      {rootRef.current && (
        <Popper
          anchorEl={rootRef.current}
          open={isListOpen}
          placement={popperPosition}
          role={null as any}
          style={{
            maxHeight: maxListHeight ?? "",
          }}
          ref={floating}
          {...popperProps}
        >
          <TooltipContext.Provider value={tooltipContext}>
            <ListStateContext.Provider value={listContext}>
              <ListBase
                {...{
                  ListItem,
                  disabled,
                  itemCount,
                  itemToString,
                  width: listWidth || rootWidth,
                  source,
                  ...restListProps,
                  listRef: setListRef,
                }}
                maxHeight={maxListHeight || listProps.maxHeight}
              />
            </ListStateContext.Provider>
          </TooltipContext.Provider>
        </Popper>
      )}
    </>
  );
}
