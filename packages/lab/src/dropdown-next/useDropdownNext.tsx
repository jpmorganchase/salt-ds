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
import { HTMLProps, KeyboardEvent, useMemo, useState } from "react";

import { useFloatingUI, UseFloatingUIProps } from "../utils";

interface UseDropdownNextProps<T>
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
  defaultSelected?: string;
  source: T[];
}

export const useDropdownNext = ({
  defaultSelected,
  onOpenChange,
  source,
  placement: placementProp,
}: UseDropdownNextProps<T>) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const [selected, setSelected] = useState<string>(defaultSelected ?? "");
  const [highlightedIndex, setHighlightedIndex] = useState(
    selected ? source.indexOf(selected) : -1
  );

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
  const blurHandler = () => {
    // listBlurHandler();
    setOpen(false);
  };

  const focusHandler = (event) => {
    // setOpen(??);
  };

  const mouseDownHandler = (evt) => {
    console.log("Mouse down", evt);

    setOpen(!open);
  };

  const selectHandler = (event) => {
    console.log("selectHandler", event.target.dataset.value);

    setValue(event.target.dataset.value);
    setSelected(event.target.dataset.value);
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key, target } = event;
    switch (key) {
      case "ArrowUp":
        setOpen(true);
        setHighlightedIndex(Math.max(0, highlightedIndex - 1));
        break;
      case "ArrowDown":
        setOpen(true);
        setHighlightedIndex(Math.min(source.length - 1, highlightedIndex + 1));
        break;
      case " ":
      case "Enter":
        if (!open) {
          setOpen(true);
          break;
        }

        if (open) {
          console.log("EVENT", target);
          console.log("value", value); //?????
          // next step: find out how to get the target here to be the list item instead of the button!!!
          // setSelected(target.dataset.value); // previously value
          setSelected(value);
          setValue(value);
          setOpen(false);

          console.log("value", value);
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
      value,
      setValue,
    }),
    [value, setValue]
  );

  return {
    focusHandler,
    keyDownHandler,
    blurHandler,
    mouseDownHandler,
    contextValue,
    open,
    // value,
    selected,
    selectHandler,
    highlightedIndex,
    // valueSelected,
    // setValueSelected,
    getListItems,
    floating,
    reference,
    getDropdownNextProps,
  };
};

// keyboard nav
// --- OLD
// 1. if there's selected item, focus moves to selected item
// 2. if no selected item, focus moves to first list item
// ..then move selection one list item down
// DOM focus remains on DD, visual focus is in listbox
// aria-activedescendant: listbox option visually indicated as focused
