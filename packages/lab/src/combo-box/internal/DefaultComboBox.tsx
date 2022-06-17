import {
  Portal,
  TooltipContext,
  TooltipContextProps,
  useAriaAnnouncer,
  useFloatingUI,
  useForkRef,
  Window,
} from "@jpmorganchase/uitk-core";
import {
  HTMLAttributes,
  ReactNode,
  Ref,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import { Input, InputProps } from "../../input";
import {
  ListBase,
  ListProps,
  ListSelectionVariant,
  ListStateContext,
} from "../../list";
import { GetFilterRegex } from "../filterHelpers";
import { getAnnouncement } from "./getAnnouncement";
import { useComboBox } from "./useComboBox";

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
    | "tooltipEnterDelay"
    | "tooltipLeaveDelay"
    | "tooltipPlacement"
    | "virtualized"
    | "width"
  > & {
    ListItem?: ReactNode;
    ListProps?: Partial<ListProps<Item, Variant>>;
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
    source: ReadonlyArray<Item>;
  };

export interface DefaultComboBoxProps<Item>
  extends BaseComboBoxProps<Item>,
    Pick<InputProps, "onFocus" | "onBlur"> {
  InputProps?: InputProps;
  initialSelectedItem?: Item;
  selectedItem?: Item;
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

  return (
    <>
      <Input
        disabled={disabled}
        ref={useForkRef(setInputRef, setHookInputRef)}
        value={value}
        {...restInputProps}
      />
      {rootRef.current && isListOpen && (
        <Portal>
          <Window
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
            ref={floating}
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
