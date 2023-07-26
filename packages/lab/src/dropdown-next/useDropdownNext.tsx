import {
  useInteractions,
  useDismiss,
  useClick,
  useRole,
  flip,
  shift,
  limitShift,
  offset,
  size,
} from "@floating-ui/react";
import { ListItemNext } from "@salt-ds/lab";
import {
  HTMLProps,
  KeyboardEvent,
  useMemo,
  useState,
  FocusEvent,
  MouseEvent,
  RefObject,
} from "react";
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
  source,
  disabled,
  listRef,
  listId,
  // portal stuffs
  open: openProp,
  onOpenChange: onOpenChangeProp,
  placement: placementProp = "bottom",
}: UseDropdownNextProps<T>) => {
  const [open, setOpen] = useState(false);

  // const [open, setOpen] = useControlled({
  //   controlled: openProp,
  //   default: false,
  //   name: "DropdownNext",
  //   state: "open",
  // });

  const getListItems = (source: T[]) => {
    if (!source) return;

    return source.map((item, index) => {
      if (typeof item === "string") {
        return (
          <ListItemNext key={index} value={item}>
            {item}
          </ListItemNext>
        );
      }

      return (
        <ListItemNext
          key={item?.id ?? index}
          value={item.value}
          disabled={item?.disabled ?? false}
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
    mouseOverHandler: listMouseOverHandler,
    // mouseDownHandler: listMouseDownHandler,
    activeDescendant,
    selectedItem,
    highlightedItem,
    contextValue: listContextValue,
    focusVisibleRef: listFocusVisibleRef,
  } = useList({
    disabled,
    defaultSelected,
    id: listId,
    ref: listRef,
  });

  // FLOATING PORTAL
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChangeProp?.(open);
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
    onOpenChange,
    placement: placementProp, //  "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end"
    middleware: [
      offset(0),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
      flip(),
      shift({ limiter: limitShift() }),
    ],
  });

  const { getFloatingProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: "listbox" }),
    useClick(context),
    // useFocus(context), // Opens the floating element while the reference element has focus, like CSS
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
    console.log("useDD hook: focusHandler");
    // listFocusHandler(event);
    setOpen(true);
  };

  const mouseOverHandler = (event: MouseEvent<HTMLElement>) => {
    listMouseOverHandler(event);
  };

  const keyDownHandler = (event: KeyboardEvent) => {
    console.log("useDD hook: keyDOwnHandler");
    const { key } = event;
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
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
          listKeyDownHandler(event);
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
    mouseOverHandler,
    contextValue,
    activeDescendant,
    selectedItem,
    highlightedItem,
    setListRef: listFocusVisibleRef,
    getListItems,
    // portal stuffs
    open,
    setOpen,
    floating,
    reference,
    getDropdownNextProps,
  };
};
