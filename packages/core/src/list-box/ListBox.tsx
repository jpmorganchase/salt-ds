import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useRef,
} from "react";
import {
  ListControlContext,
  type OptionValue,
} from "../list-control/ListControlContext";
import {
  defaultValueToString,
  type ListControlProps,
  useListControl,
} from "../list-control/ListControlState";
import { makePrefixer, useForkRef } from "../utils";

import listBoxCss from "./ListBox.css";

export type ListBoxProps<Item = string> = {
  /**
   * If `true`, the list box will be disabled.
   */
  disabled?: boolean;
  /**
   * If `false`, the list box will have not a border.
   */
  bordered?: boolean;
  /**
   * The options to display in the list box.
   */
  children?: ReactNode;
  /**
   * If `true`, the list box will be multiselect.
   */
  multiselect?: boolean;
} & ComponentPropsWithoutRef<"div"> &
  Omit<ListControlProps<Item>, "onOpenChange">;

const withBaseName = makePrefixer("saltListBox");

export const ListBox = forwardRef(function ListBox<Item>(
  props: ListBoxProps<Item>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    bordered,
    className,
    children,
    defaultSelected,
    disabled,
    selected,
    onSelectionChange,
    multiselect,
    valueToString = defaultValueToString,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list-box",
    css: listBoxCss,
    window: targetWindow,
  });

  const listControl = useListControl<Item>({
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    valueToString,
    disabled,
  });

  const {
    activeState,
    setActive,
    getOptionAtIndex,
    getIndexOfOption,
    getOptionsMatching,
    getOptionFromSearch,
    getFirstOption,
    getLastOption,
    getOptionAfter,
    getOptionBefore,
    getOptionPageAbove,
    getOptionPageBelow,
    selectedState,
    select,
    setFocusVisibleState,
    setFocusedState,
    setListRef,
  } = listControl;

  const typeaheadString = useRef("");
  const typeaheadTimeout = useRef<number | undefined>();

  const handleTypeahead = (event: KeyboardEvent<HTMLDivElement>) => {
    if (typeaheadTimeout.current) {
      clearTimeout(typeaheadTimeout.current);
    }
    typeaheadString.current += event.key;
    typeaheadTimeout.current = window.setTimeout(() => {
      typeaheadString.current = "";
    }, 500);

    let newOption = getOptionFromSearch(typeaheadString.current, activeState);

    if (!newOption) {
      newOption = getOptionFromSearch(typeaheadString.current);
    }

    if (newOption) {
      setActive(newOption);
      setFocusVisibleState(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      event.stopPropagation();
      handleTypeahead(event);
    }

    const activeOption = activeState ?? getFirstOption()?.data;

    if (activeOption === undefined) {
      return;
    }

    let newActive:
      | { data: OptionValue<Item>; element: HTMLElement }
      | undefined;
    switch (event.key) {
      case "ArrowDown":
        newActive = getOptionAfter(activeOption) ?? getLastOption();
        break;
      case "ArrowUp":
        newActive = getOptionBefore(activeOption) ?? getFirstOption();
        break;
      case "Home":
        newActive = getFirstOption();
        break;
      case "End":
        newActive = getLastOption();
        break;
      case "PageUp":
        newActive = getOptionPageAbove(activeOption);
        break;
      case "PageDown":
        newActive = getOptionPageBelow(activeOption);
        break;
      case "Enter":
      case " ":
        if (
          Boolean(activeState?.disabled) ||
          (typeaheadString.current.trim().length > 0 && event.key === " ")
        ) {
          event.preventDefault();
          return;
        }

        if (!activeState) {
          return;
        }

        event.preventDefault();
        select(event, activeState);

        break;
    }

    if (newActive && newActive.data.id !== activeState?.id) {
      event.preventDefault();
      setActive(newActive.data);
      setFocusVisibleState(true);
    }
  };

  const wasMouseDown = useRef(false);

  const handleMouseDown = () => {
    wasMouseDown.current = true;
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (wasMouseDown.current) {
      wasMouseDown.current = false;
      return;
    }

    setFocusVisibleState(true);
    wasMouseDown.current = false;

    // We check the active index because the active item may have been removed
    const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
    let newActive: ReturnType<typeof getOptionAtIndex>;

    // If the active item is still in the list, we don't need to do anything
    if (activeIndex > 0) {
      return;
    }

    // If we have selected an item, we should make that the active item
    if (selectedState.length > 0) {
      newActive = getOptionsMatching(
        (option) => option.value === selectedState[0],
      ).pop();
    }

    // If we still don't have an active item, we should just select the first item
    if (!newActive) {
      newActive = getOptionAtIndex(0);
    }

    setActive(newActive?.data);
    setFocusedState(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    setFocusedState(false);
    setActive(undefined);
    onBlur?.(event);
  };

  const handleListMouseOver = () => {
    setFocusVisibleState(false);
    setActive(undefined);
  };

  const handleRef = useForkRef(setListRef, ref);

  return (
    <ListControlContext.Provider value={listControl}>
      <div
        className={clsx(
          withBaseName(),
          { [withBaseName("bordered")]: bordered },
          className,
        )}
        role="listbox"
        aria-activedescendant={activeState?.id}
        aria-disabled={disabled || undefined}
        aria-multiselectable={multiselect}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseOver={handleListMouseOver}
        onMouseDown={handleMouseDown}
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: ListBoxProps<Item> & { ref?: Ref<HTMLDivElement> },
) => JSX.Element;
