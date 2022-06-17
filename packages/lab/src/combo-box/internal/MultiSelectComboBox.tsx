import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import {
  Portal,
  TooltipContext,
  useAriaAnnouncer,
  useFloatingUI,
  useForkRef,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListBase, ListStateContext } from "../../list";
import { TokenizedInputBase, TokenizedInputProps } from "../../tokenized-input";
import { BaseComboBoxProps } from "./DefaultComboBox";
import { getAnnouncement } from "./getAnnouncement";
import { useMultiSelectComboBox } from "./useMultiSelectComboBox";

export type MultiSelectComboBoxProps<Item> = BaseComboBoxProps<
  Item,
  "multiple"
> &
  Pick<
    TokenizedInputProps<Item>,
    | "onFocus"
    | "onBlur"
    | "onInputFocus"
    | "onInputBlur"
    | "onInputChange"
    | "onInputSelect"
    | "stringToItem"
  > & {
    InputProps?: Partial<TokenizedInputProps<Item>>;
    initialSelectedItem?: Item[];
    selectedItem?: Item[];
    multiSelect: true;
    delimiter?: string | string[];
  };

export function MultiSelectComboBox<Item>(
  props: MultiSelectComboBoxProps<Item>
) {
  const {
    ListItem,
    Tooltip,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    tooltipPlacement,
    rootRef,
    listRef: listRefProp,
    rootWidth,
    listWidth,
    inputRef: inputRefProp,
    ...restProps
  } = props;

  const { announce } = useAriaAnnouncer({ debounce: 1000 });

  const expandButtonRef = useRef(null);
  const listRef = useRef(null);
  // Use callback ref as listRef could be null when it's closed
  const setListRef = useForkRef(listRef, listRefProp);

  const { inputRef, listContext, inputProps, listProps, inputHelpers } =
    useMultiSelectComboBox({
      ...restProps,
      expandButtonRef,
    });

  const { allowAnnouncement, disabled, value, ...restInputProps } = inputProps;
  const { isListOpen, itemCount, itemToString, source, ...restListProps } =
    listProps;

  const tooltipContext = useMemo(
    () => ({
      Tooltip,
      enterDelay: tooltipEnterDelay,
      leaveDelay: tooltipLeaveDelay,
      placement: tooltipPlacement,
    }),
    [Tooltip, tooltipEnterDelay, tooltipLeaveDelay, tooltipPlacement]
  );

  const firstItem = null;

  const allowAnnouncementRef = useRef(allowAnnouncement);
  useEffect(() => {
    allowAnnouncementRef.current = allowAnnouncement;
  }, [allowAnnouncement]);

  useEffect(() => {
    if (allowAnnouncementRef.current && value && firstItem) {
      announce(getAnnouncement(itemCount, firstItem));
    }
  }, [value, firstItem, itemCount, announce]);

  const [maxListHeight, setMaxListHeight] = useState<number | undefined>(
    undefined
  );
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware: [
      flip({
        fallbackPlacements: ["bottom-start", "top-start"],
      }),
      shift({ limiter: limitShift() }),
      size({
        apply({ availableHeight }) {
          setMaxListHeight(availableHeight);
        },
      }),
    ],
  });

  useEffect(() => {
    if (rootRef.current) {
      reference(rootRef.current);
    }
  }, [rootRef, reference]);

  const Window = useWindow();

  return (
    <>
      <TooltipContext.Provider value={tooltipContext}>
        <TokenizedInputBase
          disabled={disabled}
          expandButtonRef={expandButtonRef}
          inputRef={useForkRef(inputRef, inputRefProp)}
          value={value}
          helpers={inputHelpers}
          {...restInputProps}
        />
      </TooltipContext.Provider>
      {rootRef.current && isListOpen && (
        <Portal>
          <Window
            ref={floating}
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
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
          </Window>
        </Portal>
      )}
    </>
  );
}
