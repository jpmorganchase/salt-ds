import {
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useFocus,
  useInteractions,
} from "@floating-ui/react";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  Children,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Button } from "../button";
import { useFormFieldProps } from "../form-field-context";
import {
  ListControlContext,
  type OptionValue,
} from "../list-control/ListControlContext";
import { defaultValueToString } from "../list-control/ListControlState";
import { OptionList } from "../option/OptionList";
import { PillInput, type PillInputProps } from "../pill-input";
import { useIcon } from "../semantic-icon-provider";
import type { DataAttributes } from "../types";
import {
  makePrefixer,
  type UseFloatingUIProps,
  useFloatingUI,
  useForkRef,
  useId,
} from "../utils";
import { type UseComboBoxProps, useComboBox } from "./useComboBox";

export type ComboBoxProps<Item = string> = {
  /**
   * The options to display in the combo box.
   */
  children?: ReactNode;
  /**
   * If true, options will be selected when the tab key is pressed.
   */
  selectOnTab?: boolean;
  /**
   *  Props to pass to ComboBox's overlay.
   */
  OverlayProps?: Omit<ComponentPropsWithoutRef<"div">, "children" | "id"> &
    DataAttributes;
} & UseComboBoxProps<Item> &
  Omit<PillInputProps, "onPillRemove">;

const withBaseName = makePrefixer("saltComboBox");

export const ComboBox = forwardRef(function ComboBox<Item>(
  props: ComboBoxProps<Item>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    children,
    className,
    disabled: disabledProp,
    endAdornment: endAdornmentProp,
    readOnly: readOnlyProp,
    multiselect,
    selectOnTab = !multiselect,
    onSelectionChange,
    selected,
    defaultSelected,
    defaultOpen,
    onOpenChange,
    onChange,
    open,
    inputRef: inputRefProp,
    inputProps: inputPropsProp,
    variant = "primary",
    onKeyDown,
    onFocus,
    onBlur,
    value,
    defaultValue,
    valueToString = defaultValueToString,
    truncate,
    bordered = false,
    OverlayProps,
    ...rest
  } = props;

  const { CollapseIcon, ExpandIcon } = useIcon();
  const {
    a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
  } = useFormFieldProps();

  const disabled = Boolean(disabledProp) || formFieldDisabled;
  const readOnly = Boolean(readOnlyProp) || formFieldReadOnly;
  const inputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useForkRef(inputRef, inputRefProp);
  const shouldAutoSelectRef = useRef(false);

  const listControl = useComboBox<Item>({
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
    value,
    defaultValue,
    disabled,
    readOnly,
    valueToString,
  });

  const {
    activeState,
    setActive,
    openState,
    setOpen,
    openKey,
    getOptionsMatching,
    getFirstOption,
    getLastOption,
    getOptionAfter,
    getOptionBefore,
    getOptionPageAbove,
    getOptionPageBelow,
    selectedState,
    select,
    clear,
    focusVisibleState,
    setFocusVisibleState,
    focusedState,
    setFocusedState,
    listRef,
    setListRef,
    valueState,
    setValueState,
    removePill,
  } = listControl;

  const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
    newOpen,
    _event,
    reason,
  ) => {
    const focusNotBlur = reason === "focus" && newOpen;
    if (reason === "focus") {
      setFocusedState(newOpen);
    }

    if (reason === "focus" && !newOpen) {
      setFocusVisibleState(false);
    }

    if (readOnly || focusNotBlur) return;
    setOpen(newOpen);

    if (newOpen) {
      inputRef.current?.focus();
    }
  };

  const hasValidChildren =
    Children.toArray(children).filter(Boolean).length > 0;

  const { x, y, strategy, elements, floating, reference, context } =
    useFloatingUI({
      open: openState && !readOnly && hasValidChildren,
      onOpenChange: handleOpenChange,
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [
        offset(1),
        size({
          apply({ rects, elements, availableHeight }) {
            elements.floating.style.setProperty(
              "--overlay-minWidth",
              `${rects.reference.width}px`,
            );
            elements.floating.style.setProperty(
              "--overlay-maxHeight",
              `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
            );
          },
        }),
        flip({ fallbackStrategy: "initialPlacement" }),
      ],
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useFocus(context),
    useClick(context, { keyboardHandlers: false, toggle: false }),
  ]);

  const handleRef = useForkRef<HTMLDivElement>(reference, ref);

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!readOnly) {
      event.stopPropagation();
      setFocusVisibleState(false);
      setOpen(!openState, "manual");
    }
  };

  const handleButtonFocus = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (!event.repeat) {
      shouldAutoSelectRef.current = false;
    }

    if (readOnly) {
      return;
    }

    if (!openState) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setOpen(true, undefined, event.key);
        return;
      }
    }

    const activeOption = activeState;

    let newActive:
      | { data: OptionValue<Item>; element: HTMLElement }
      | undefined;
    switch (event.key) {
      case "ArrowDown":
        newActive = activeOption
          ? getOptionAfter(activeOption)
          : getFirstOption();
        break;
      case "ArrowUp":
        newActive = activeOption
          ? getOptionBefore(activeOption)
          : getLastOption();
        break;
      case "Home":
        newActive = getFirstOption();
        break;
      case "End":
        newActive = getLastOption();
        break;
      case "PageUp":
        if (activeOption) {
          newActive = getOptionPageAbove(activeOption);
        } else {
          const lastOption = getLastOption();
          if (lastOption) {
            newActive = getOptionPageAbove(lastOption?.data);
          }
        }
        break;
      case "PageDown":
        if (activeOption) {
          newActive = getOptionPageBelow(activeOption);
        } else {
          const firstOption = getFirstOption();
          if (firstOption) {
            newActive = getOptionPageBelow(firstOption.data);
          }
        }
        break;
      case "Enter":
        if (openState && activeState?.disabled) {
          event.preventDefault();
          return;
        }

        if (!openState || !activeState) {
          return;
        }

        select(event, activeState);

        if (!multiselect) {
          event.preventDefault();
        }

        break;
      case "Tab":
        if (
          openState &&
          selectOnTab &&
          activeState &&
          !activeState?.disabled &&
          !selectedState.includes(activeState?.value)
        ) {
          select(event, activeState);
        }
        break;
    }

    if (newActive) {
      setFocusVisibleState(true);
    }

    if (newActive && newActive.data.id !== activeState?.id) {
      event.preventDefault();
      setActive(newActive.data);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget === inputRef.current) {
      setFocusedState(true);
    } else {
      setActive(undefined);
    }
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    event.persist();
    if (!listRef.current || !listRef.current.contains(event.relatedTarget)) {
      onBlur?.(event);
      shouldAutoSelectRef.current = false;
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!openState) {
      setOpen(true, "input");
    }

    if (value === "" && !multiselect) {
      clear(event);
    }

    setValueState(value);

    // Clean active item if no text is present.
    if (value === "") {
      setActive(undefined);
    } else {
      shouldAutoSelectRef.current = true;
    }

    onChange?.(event);
  };

  const handlePillRemove = (event: SyntheticEvent, index: number) => {
    event.stopPropagation();
    const removed = selectedState[index];
    removePill(event, removed);
  };

  const handleListMouseOver = () => {
    setFocusVisibleState(false);
  };

  const handleListMouseLeave = () => {
    setActive(undefined);
  };

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (value) {
      shouldAutoSelectRef.current = true;
    }
  }, [value]);

  useEffect(() => {
    if (openState && value) {
      queueMicrotask(() => {
        const newOption = getFirstOption();
        if (newOption && shouldAutoSelectRef.current) {
          setActive(newOption.data);
        }
      });
    }
  }, [value, setActive, openState, getFirstOption]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run when the list's openState or the displayed options change.
  useEffect(() => {
    let newActive: ReturnType<typeof getFirstOption>;

    if (!openState) {
      setActive(undefined);
      return;
    }

    // If we have selected an item, we should make that the active item
    if (selectedState.length > 0) {
      newActive = getOptionsMatching(
        (option) => option.value === selectedState[0],
      ).pop();
    }

    // If we still don't have an active item, we should check if the list has been opened with the keyboard
    if (!newActive) {
      if (openKey.current === "ArrowDown") {
        newActive = getFirstOption();
        setFocusVisibleState(true);
      } else if (openKey.current === "ArrowUp") {
        newActive = getLastOption();
        setFocusVisibleState(true);
      }
    }

    if (newActive) {
      setActive(newActive?.data);
    }
  }, [openState]);

  const buttonId = useId();
  const listId = useId();

  const handleListRef = useForkRef<HTMLDivElement>(setListRef, floating);

  const showOptionsButton = (
    <Button
      aria-labelledby={clsx(buttonId, formFieldLabelledBy)}
      aria-label="Show options"
      aria-expanded={openState}
      aria-controls={openState ? listId : undefined}
      aria-haspopup="listbox"
      disabled={disabled}
      appearance="transparent"
      onClick={handleButtonClick}
      onFocus={handleButtonFocus}
      tabIndex={-1}
    >
      {openState ? <CollapseIcon aria-hidden /> : <ExpandIcon aria-hidden />}
    </Button>
  );

  // avoid render empty fragment, or empty div appear in PillInput
  const endAdornment =
    !readOnly && hasValidChildren ? (
      <>
        {endAdornmentProp}
        {showOptionsButton}
      </>
    ) : (
      endAdornmentProp
    );

  return (
    <ListControlContext.Provider value={listControl}>
      <PillInput
        // Ensures that the field is focused when you don't directly click on the input.
        tabIndex={!disabled ? -1 : undefined}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("focused")]: focusedState,
            [withBaseName("focusVisible")]: focusVisibleState,
          },
          className,
        )}
        endAdornment={endAdornment}
        onChange={handleChange}
        // Workaround to have readonly conveyed by screen readers (https://github.com/jpmorganchase/salt-ds/issues/4586)
        role={readOnly ? "textbox" : "combobox"}
        disabled={disabled}
        readOnly={readOnly}
        inputProps={{
          "aria-readonly": readOnly ? "true" : undefined,
          "aria-expanded": !readOnly ? openState : undefined,
          "aria-controls": openState && !readOnly ? listId : undefined,
          onKeyDown: handleKeyDown,
          ...inputPropsProp,
        }}
        aria-activedescendant={activeState?.id}
        variant={variant}
        inputRef={handleInputRef}
        value={valueState}
        ref={handleRef}
        bordered={bordered}
        {...getReferenceProps({
          onBlur: handleBlur,
          onFocus: handleFocus,
          ...rest,
        })}
        pills={
          multiselect ? selectedState.map((item) => valueToString(item)) : []
        }
        truncate={truncate && !focusedState && !openState}
        onPillRemove={handlePillRemove}
        hidePillClose={!focusedState || readOnly}
        emptyReadOnlyMarker={
          readOnly && selectedState.length > 0 ? "" : undefined
        }
      />
      <OptionList
        aria-multiselectable={multiselect}
        open={(openState || focusedState) && !readOnly && hasValidChildren}
        collapsed={!openState}
        ref={handleListRef}
        id={listId}
        tabIndex={-1}
        {...getFloatingProps({
          onMouseOver: handleListMouseOver,
          onFocus: handleFocusInput,
          onClick: handleFocusInput,
          onMouseLeave: handleListMouseLeave,
          ...OverlayProps,
        })}
        left={x ?? 0}
        top={y ?? 0}
        position={strategy}
        width={elements.floating?.offsetWidth}
        height={elements.floating?.offsetHeight}
      >
        {children}
      </OptionList>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: ComboBoxProps<Item> & { ref?: Ref<HTMLDivElement> },
) => JSX.Element;
