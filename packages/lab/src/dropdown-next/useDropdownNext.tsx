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
import {
  useControlled,
  useFloatingUI,
  UseFloatingUIProps,
} from "@salt-ds/core";
import { ListItemNext } from "@salt-ds/lab";
import {
  HTMLProps,
  KeyboardEvent,
  useMemo,
  FocusEvent,
  RefObject,
} from "react";
import { useList } from "../list-next/useList";

interface UseDropdownNextProps<T>
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
  defaultSelected?: string;
  source: T[];
  disabled?: boolean;
  listRef: RefObject<HTMLUListElement>;
  listId?: string;
  openProp?: boolean;
}

export const useDropdownNext = ({
  defaultSelected,
  disabled,
  listRef,
  listId,
  openProp,
  onOpenChange: onOpenChangeProp,
  placement: placementProp,
}: UseDropdownNextProps<T>) => {
  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: "DropdownNext",
    state: "open",
  });

  // USELIST HOOK
  const {
    focusHandler: listFocusHandler,
    keyDownHandler: listKeyDownHandler,
    blurHandler: listBlurHandler,
    mouseOverHandler: listMouseOverHandler,
    activeDescendant,
    selectedItem,
    setSelectedItem,
    highlightedItem,
    setHighlightedItem,
    contextValue: listContextValue,
    focusVisibleRef: listFocusVisibleRef,
  } = useList({
    disabled,
    defaultSelected,
    id: listId,
    ref: listRef,
  });

  console.log("useList hook", selectedItem, highlightedItem);
  const { select, highlight } = listContextValue;

  // LIST SOURCE
  const getListItems = (source: T[]) => {
    if (!source) return;

    return source.map((item, index) => {
      if (typeof item === "string") {
        return (
          <ListItemNext
            key={index}
            value={item}
            onMouseDown={(event) => {
              select(event);
              console.log("mousedown", selectedItem, highlightedItem);
            }}
            onClick={(event) => {
              select(event);
              console.log("click", selectedItem, highlightedItem);
            }}
            onMouseMove={(event) => {
              highlight(event);
              console.log("mousemove", selectedItem, highlightedItem);
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
          onMouseDown={(event) => {
            select(event);
          }}
          onClick={(event) => {
            select(event);
          }}
          onMouseMove={(event) => {
            highlight(event);
          }}
        >
          {item.value}
        </ListItemNext>
      );
    });
  };

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
  const blurHandler = () => {
    listBlurHandler();
    setOpen(false);
  };

  // handles focus on mouse and keyboard
  const focusHandler = (event: FocusEvent<HTMLElement>) => {
    if (selectedItem) {
      // setHighlightedItem(selectedItem);
      listFocusHandler(event as FocusEvent<HTMLUListElement>);
    }
  };

  // handles mouse click on dropdown button
  const mouseDownHandler = () => {
    setOpen(!open);
  };

  // handles mouse hover on dropdown button
  const mouseOverHandler = () => {
    listMouseOverHandler();
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLElement>) => {
    const { key } = event;
    switch (key) {
      case "ArrowUp":

        listKeyDownHandler(event as KeyboardEvent<HTMLUListElement>);
        break;
      case "ArrowDown":
        setOpen(true);
        listKeyDownHandler(event as KeyboardEvent<HTMLUListElement>);
        break;
      case " ":
      case "Enter":
        if (!open) {
          setOpen(true);
          break;
        }
        if (open) {
          listKeyDownHandler(event as KeyboardEvent<HTMLUListElement>);
          setOpen(false);
          break;
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      case "PageUp":
      case "PageDown":
      case "Home":
      case "End":
        if (open) {
          listKeyDownHandler(event as KeyboardEvent<HTMLUListElement>);
          break;
        }
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
    mouseDownHandler,
    contextValue,
    activeDescendant,
    selectedItem,
    setSelectedItem,
    highlightedItem,
    setHighlightedItem,
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
