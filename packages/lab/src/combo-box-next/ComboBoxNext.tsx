import {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
  SyntheticEvent,
  useEffect,
  useRef,
} from "react";
import {
  Button,
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  UseFloatingUIProps,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { defaultValueToString } from "../list-control/ListControlState";
import { ListControlContext } from "../list-control/ListControlContext";
import { clsx } from "clsx";
import {
  flip,
  size,
  useClick,
  useDismiss,
  useFocus,
  useInteractions,
} from "@floating-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { useComboBoxNext, UseComboBoxNextProps } from "./useComboBoxNext";
import { OptionList } from "../option/OptionList";
import { PillInput, PillInputProps } from "../pill-input";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxNextCss from "./ComboBoxNext.css";

export type ComboBoxNextProps<Item = string> = {
  /**
   * The options to display in the combo box.
   */
  children?: ReactNode;
} & UseComboBoxNextProps<Item> &
  PillInputProps;

const withBaseName = makePrefixer("saltComboBoxNext");

export const ComboBoxNext = forwardRef(function ComboBox<Item>(
  props: ComboBoxNextProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    disabled: disabledProp,
    endAdornment,
    readOnly: readOnlyProp,
    multiselect,
    onSelectionChange,
    selected,
    defaultSelected,
    defaultOpen,
    onOpenChange,
    onChange,
    open,
    inputProps: inputPropsProp,
    variant = "primary",
    onClick,
    onKeyDown,
    onFocus,
    onBlur,
    value,
    defaultValue,
    valueToString = defaultValueToString,
    truncate,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-combo-box-next",
    css: comboBoxNextCss,
    window: targetWindow,
  });

  const {
    a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
  } = useFormFieldProps();

  const disabled = Boolean(disabledProp) || formFieldDisabled;
  const readOnly = Boolean(readOnlyProp) || formFieldReadOnly;
  const inputRef = useRef<HTMLInputElement>(null);

  const listControl = useComboBoxNext<Item>({
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
    getOptionAtIndex,
    getIndexOfOption,
    getOptionsMatching,
    options,
    selectedState,
    select,
    clear,
    focusVisibleState,
    setFocusVisibleState,
    focusedState,
    setFocusedState,
    listRef,
    valueState,
    setValueState,
  } = listControl;

  const { Component: FloatingComponent } = useFloatingComponent();

  const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
    newOpen,
    _event,
    reason
  ) => {
    const focusNotBlur = reason === "focus" && newOpen;
    if (reason == "focus") {
      setFocusedState(newOpen);
    }

    if (reason == "focus" && !newOpen) {
      setFocusVisibleState(false);
    }

    if (readOnly || focusNotBlur) return;
    setOpen(newOpen);

    if (newOpen) {
      inputRef.current?.focus();
    }
  };

  const { x, y, strategy, elements, floating, reference, context } =
    useFloatingUI({
      open: openState && !readOnly && children != undefined,
      onOpenChange: handleOpenChange,
      placement: "bottom-start",
      middleware: [
        size({
          apply({ rects, elements, availableHeight }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
              maxHeight: `max(calc(${availableHeight}px - var(--salt-spacing-100)), calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5))`,
            });
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
    const currentIndex = activeState ? getIndexOfOption(activeState) : -1;
    const count = options.length - 1;

    if (readOnly) {
      return;
    }

    if (!openState) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setOpen(true, undefined, event.key);
        return;
      }
    }

    let newActive;
    switch (event.key) {
      case "ArrowDown":
        newActive = getOptionAtIndex(Math.min(count, currentIndex + 1));
        break;
      case "ArrowUp":
        newActive = getOptionAtIndex(Math.max(0, currentIndex - 1));
        break;
      case "Home":
        newActive = getOptionAtIndex(0);
        break;
      case "End":
        newActive = getOptionAtIndex(count);
        break;
      case "PageUp":
        newActive = getOptionAtIndex(Math.max(0, currentIndex - 10));
        break;
      case "PageDown":
        newActive = getOptionAtIndex(Math.min(count, currentIndex + 10));
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
        if (!multiselect && activeState) {
          select(event, activeState);
        }
        break;
    }

    if (newActive) {
      setFocusVisibleState(true);
    }

    if (newActive && newActive?.id != activeState?.id) {
      event.preventDefault();
      setActive(newActive);
    }

    onKeyDown?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocusedState(true);
    onFocus?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!openState) {
      setOpen(true, "input");
    }

    if (event.target.value === "" && !multiselect) {
      clear(event);
    }

    setValueState(event.target.value);

    // Wait for the filter to happen
    queueMicrotask(() => {
      if (event.target.value !== "") {
        const newOption = getOptionAtIndex(0);
        if (newOption) {
          setActive(newOption);
        }
      } else {
        setActive(undefined);
      }
    });
    onChange?.(event);
  };

  const handlePillRemove = (event: SyntheticEvent, index: number) => {
    event.stopPropagation();
    const removed = selectedState[index];
    select(event, getOptionsMatching((option) => option.value === removed)[0]);
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

  useEffect(() => {
    // We check the active index because the active item may have been removed
    const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
    let newActive = undefined;

    // If the active item is still in the list, we don't need to do anything
    if (activeIndex > -1) {
      return;
    }

    // If the list is closed we should clear the active item
    if (!openState) {
      setActive(undefined);
      return;
    }

    // If we have selected an item, we should make that the active item
    if (selectedState.length > 0) {
      newActive = getOptionsMatching(
        (option) => option.value === selectedState[0]
      ).pop();
    }

    // If we still don't have an active item, we should check if the list has been opened with the keyboard
    if (!newActive) {
      if (openKey.current === "ArrowDown") {
        newActive = getOptionAtIndex(0);
        setFocusVisibleState(true);
      } else if (openKey.current === "ArrowUp") {
        newActive = getOptionAtIndex(options.length - 1);
        setFocusVisibleState(true);
      }
    }

    // If we still don't have an active item, we should just select the first item
    if (!newActive) {
      newActive = getOptionAtIndex(0);
    }

    setActive(newActive);
  }, [openState, children]);

  const buttonId = useId();
  const listId = useId();

  return (
    <ListControlContext.Provider value={listControl}>
      <PillInput
        className={clsx(
          withBaseName(),
          {
            [withBaseName("focused")]: focusedState,
            [withBaseName("focusVisible")]: focusVisibleState,
          },
          className
        )}
        endAdornment={
          <>
            {endAdornment}
            {!readOnly ? (
              <Button
                aria-labelledby={clsx(buttonId, formFieldLabelledBy)}
                aria-label="Show options"
                aria-expanded={openState}
                aria-controls={openState ? listId : undefined}
                aria-haspopup="listbox"
                disabled={disabled}
                variant="secondary"
                onClick={handleButtonClick}
                onFocus={handleButtonFocus}
                tabIndex={-1}
              >
                {openState ? (
                  <ChevronUpIcon aria-hidden />
                ) : (
                  <ChevronDownIcon aria-hidden />
                )}
              </Button>
            ) : undefined}
          </>
        }
        onChange={handleChange}
        role="combobox"
        disabled={disabled}
        readOnly={readOnly}
        inputProps={{
          role: "combobox",
          "aria-expanded": openState,
          "aria-multiselectable": multiselect,
          "aria-controls": openState ? listId : undefined,
          onKeyDown: handleKeyDown,
          ...inputPropsProp,
        }}
        aria-activedescendant={activeState?.id}
        variant={variant}
        inputRef={inputRef}
        value={valueState}
        ref={handleRef}
        {...getReferenceProps({
          onBlur,
          onFocus: handleFocus,
          ...rest,
        })}
        pills={
          multiselect ? selectedState.map((item) => valueToString(item)) : []
        }
        truncate={truncate && !focusedState && !openState}
        onPillRemove={handlePillRemove}
        hidePillClose={!focusedState}
      />
      <FloatingComponent
        open={(openState || focusedState) && !readOnly && children != undefined}
        {...getFloatingProps()}
        left={x ?? 0}
        top={y ?? 0}
        position={strategy}
        width={elements.floating?.offsetWidth}
        height={elements.floating?.offsetHeight}
        ref={floating}
      >
        <OptionList
          collapsed={!openState}
          ref={listRef}
          id={listId}
          onMouseOver={handleListMouseOver}
          onFocus={handleFocusInput}
          onClick={handleFocusInput}
          onMouseLeave={handleListMouseLeave}
          tabIndex={-1}
        >
          {children}
        </OptionList>
      </FloatingComponent>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: ComboBoxNextProps<Item> & { ref?: Ref<HTMLDivElement> }
) => JSX.Element;
