import {
  useInteractions,
  useDismiss,
  useClick,
  useRole,
  useFocus,
  flip,
  shift,
  limitShift,
  offset,
} from "@floating-ui/react";
import { ListItemNext } from "@salt-ds/lab";
import {
  HTMLProps,
  KeyboardEvent,
  useMemo,
  useState,
  FocusEvent,
  RefObject,
} from "react";
import { BooleanLiteral } from "typescript";
import { useList } from "../list-next/useList";

import { useFloatingUI, UseFloatingUIProps } from "../utils";

interface UseDropdownNextProps<T>
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
  defaultSelected?: string;
  source: T[];
  disabled?: boolean;
  listRef: RefObject<HTMLUListElement>;
  listId?: string;
}

export const useDropdownNext = ({
  defaultSelected,
  onOpenChange,
  source,
  disabled,
  listRef,
  listId,
  placement: placementProp,
}: UseDropdownNextProps<T>) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  // const [selected, setSelected] = useState<string>(defaultSelected ?? "");

  // const [open, setOpen] = useControlled({
  //   controlled: openProp,
  //   default: false,
  //   name: "DropdownNext",
  //   state: "open",
  // });

  const getListItems = (source: T[], handleSelect: (evt) => void) => {
    if (!source) return;

    return source.map((item, index) => {
      if (typeof item === "string") {
        return (
          <ListItemNext
            key={index}
            value={item}
            onClick={(evt) => {
              console.log("clicked on item");
              handleSelect(evt);
            }}
          >
            {item}
          </ListItemNext>
        );
      }

      return (
        <ListItemNext
          key={item?.id ?? index}
          value={item.value}
          disabled={item?.disabled ?? false}
          onClick={() => {
            console.log("clicked on item");
            handleSelect(item);
          }}
        >
          {item.value}
        </ListItemNext>
      );
    });
  };

  // USELIST HOOK
  const {
    focusHandler: listFocusHandler,
    keyDownHandler: listKeyDownHandler,
    blurHandler: listBlurHandler,
    activeDescendant: listActiveDescendant,
    contextValue: listContextValue,
    focusVisibleRef: listFocusVisibleRef,
    selectedItem,
    highlightedIndex,
  } = useList({
    disabled,
    defaultSelected,
    id: listId,
    ref: listRef,
  });

  // FLOATING PORTAL
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const {
    floating,
    reference,
    x,
    y,
    strategy, // 'absolute' | 'fixed'
    placement,
    context,
  } = useFloatingUI({
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp, //  "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end"
    middleware: [flip(), shift({ limiter: limitShift() })],
  });

  const { getFloatingProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: "listbox" }),
    useClick(context),
    useFocus(context), // Opens the floating element while the reference element has focus, like CSS
  ]);

  const getDropdownNextProps = (): HTMLProps<HTMLDivElement> => {
    return getFloatingProps({
      // @ts-ignore
      "data-placement": placement,
      ref: floating,
      style: {
        top: y ?? 0,
        left: x ?? 0,
        position: strategy,
      },
    });
  };

  // HANDLERS
  const blurHandler = (event: FocusEvent) => {
    listBlurHandler(event);
    setOpen(false);
  };

  const focusHandler = (event: FocusEvent<HTMLElement>) => {
    listFocusHandler(event);
    // setOpen(??);
  };

  const mouseDownHandler = (evt) => {
    console.log("Mouse down", evt);

    setOpen(!open);
  };

  // const selectHandler = (event) => {
  //   console.log("selectHandler", event.target.dataset.value);

  //   setValue(event.target.dataset.value);
  //   setSelected(event.target.dataset.value);
  // };

  const keyDownHandler = (event: KeyboardEvent) => {
    const { key, target } = event;
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        console.log(highlightedIndex, listActiveDescendant);
        setOpen(true);
        listKeyDownHandler(event);
        break;
      case " ":
      case "Enter":
        if (!open) {
          setOpen(true);
          break;
        }

        if (open) {
          console.log("EVENT", target);
          // console.log("value", value); //?????
          // next step: find out how to get the target here to be the list item instead of the button!!!
          // setSelected(target.dataset.value); // previously value
          // setValue(value);
          setOpen(false);

          break;
        }

        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  // CONTEXT
  const contextValue = useMemo(
    () => ({
      ...listContextValue,
    }),
    [listContextValue]
  );

  return {
    focusHandler,
    keyDownHandler,
    blurHandler,
    mouseDownHandler,
    contextValue,
    listActiveDescendant,
    // value,
    selectedItem,
    highlightedIndex,
    setListRef: listFocusVisibleRef,
    getListItems,
    // portal
    open,
    setOpen,
    floating,
    reference,
    getDropdownNextProps,
  };
};
