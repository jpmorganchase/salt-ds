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
  // props for controlled dropdown
  openControlProp?: boolean;
  selectedItemControlProp?: string;
  highlightedItemControlProp?: string;
}

export const useDropdownNext = ({
  defaultSelected,
  disabled,
  listRef,
  listId,
  openControlProp,
  selectedItemControlProp,
  highlightedItemControlProp,
  onOpenChange: onOpenChangeProp,
  placement: placementProp,
}: UseDropdownNextProps<T>) => {
  const [open, setOpen] = useControlled({
    controlled: openControlProp,
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
    highlightedItem: highlightedItemControlProp,
    selected: selectedItemControlProp,
  });

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
            }}
            onMouseMove={(event) => {
              highlight(event);
            }}
          >
            {item}
          </ListItemNext>
        );
      }

      return (
        <ListItemNext
          key={item.id ?? index}
          value={item.value}
          onMouseDown={(event) => {
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
    strategy,
    placement,
    context,
  } = useFloatingUI({
    open,
    onOpenChange,
    placement: placementProp,
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
        listKeyDownHandler(event);
        break;
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
      case "PageUp":
      case "PageDown":
      case "Home":
      case "End":
        if (open) {
          listKeyDownHandler(event);
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
    open,
    setOpen,
    floating,
    reference,
    getDropdownNextProps,
  };
};
