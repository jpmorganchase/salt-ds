import { flip, limitShift, shift, size } from "@floating-ui/react";
import { useFloatingUI, useForkRef } from "@salt-ds/core";
import { useEffect, useRef, useState } from "react";
import { ListBase, ListStateContext } from "../../list-deprecated";
import { Portal } from "../../portal";
import {
  TokenizedInputBase,
  type TokenizedInputProps,
} from "../../tokenized-input";
import { isDesktop, useWindow } from "../../window";
import type { BaseComboBoxProps } from "./DefaultComboBox";
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
  props: MultiSelectComboBoxProps<Item>,
) {
  const {
    ListItem,
    WindowProps,
    rootRef,
    listRef: listRefProp,
    rootWidth,
    listWidth,
    inputRef: inputRefProp,
    ...restProps
  } = props;

  // const { announce } = useAriaAnnouncer({ debounce: 1000 });

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

  // const firstItem = null;

  const allowAnnouncementRef = useRef(allowAnnouncement);
  useEffect(() => {
    allowAnnouncementRef.current = allowAnnouncement;
  }, [allowAnnouncement]);

  // useEffect(() => {
  //   if (allowAnnouncementRef.current && value && firstItem) {
  //     announce(getAnnouncement(itemCount, firstItem));
  //   }
  // }, [value, firstItem, itemCount, announce]);

  const [maxListHeight, setMaxListHeight] = useState<number | undefined>(
    undefined,
  );
  const middleware = isDesktop
    ? []
    : [
        flip({
          fallbackPlacements: ["bottom-start", "top-start"],
        }),
        shift({ limiter: limitShift() }),
        size({
          apply({ availableHeight }) {
            setMaxListHeight(availableHeight);
          },
        }),
      ];
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware,
  });

  useEffect(() => {
    if (rootRef.current) {
      reference(rootRef.current);
    }
  }, [rootRef, reference]);

  const Window = useWindow();

  return (
    <>
      <TokenizedInputBase
        disabled={disabled}
        expandButtonRef={expandButtonRef}
        inputRef={useForkRef(inputRef, inputRefProp)}
        value={value}
        helpers={inputHelpers}
        {...restInputProps}
      />
      {rootRef.current && isListOpen && (
        <Portal>
          <Window
            style={{
              top: y ?? 0,
              left: x ?? 0,
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
            {...WindowProps}
            ref={floating}
          >
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
          </Window>
        </Portal>
      )}
    </>
  );
}
