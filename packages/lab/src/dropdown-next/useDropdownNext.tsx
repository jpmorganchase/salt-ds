import {
  useInteractions,
  useDismiss,
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
import { ListItemNext } from "../list-next";
import { HTMLProps, KeyboardEvent, FocusEvent } from "react";
import { useList, UseListProps } from "../list-next/useList";

interface UseDropdownNextProps
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
  listProps: UseListProps;
  // props for controlled dropdown
  openControlProp?: boolean;
}

export const useDropdownNext = ({
  listProps,
  openControlProp,
  onOpenChange: onOpenChangeProp,
  placement: placementProp,
}: UseDropdownNextProps) => {
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
    focusVisibleRef,
  } = useList({
    ...listProps,
  });

  const { select, highlight } = listContextValue;

  // LIST SOURCE
  const getListItems = (source: string[]) => {
    if (!source) return;

    return source.map((item, index) => {
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
    });
  };

  // FLOATING PORTAL
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChangeProp?.(open);
  };

  const { floating, reference, x, y, strategy, placement, context, elements } =
    useFloatingUI({
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
  ]);

  const getDropdownNextProps = (): HTMLProps<HTMLDivElement> => {
    return getFloatingProps({
      // @ts-ignore
      "data-placement": placement,
      ref: floating,
    });
  };

  const getPosition = () => ({
    top: y ?? 0,
    left: x ?? 0,
    position: strategy,
    width: elements.floating?.clientWidth,
    height: elements.floating?.clientHeight,
  });

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

  return {
    handlers: {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseOverHandler,
      mouseDownHandler,
    },
    activeDescendant,
    selectedItem,
    setSelectedItem,
    highlightedItem,
    setHighlightedItem,
    focusVisibleRef,
    getListItems,
    portalProps: {
      open,
      setOpen,
      floating,
      reference,
      getDropdownNextProps,
      getPosition,
    },
  };
};
