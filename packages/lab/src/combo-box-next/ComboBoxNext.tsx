import {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
  useEffect,
  useRef,
} from "react";
import {
  Button,
  Input,
  InputProps,
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  UseFloatingUIProps,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { ListControlProps } from "../list-control/ListControlState";
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
import { useComboBoxNext } from "./useComboBoxNext";
import { OptionList } from "../option/OptionList";

export interface ComboBoxNextProps<Item = string>
  extends InputProps,
    Omit<ListControlProps<Item>, "value" | "defaultValue"> {
  /**
   * The options to display in the combo box.
   */
  children?: ReactNode;
}

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
    ...rest
  } = props;

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
    if (readOnly || focusNotBlur) return;
    setOpen(newOpen);
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
    useClick(context, { keyboardHandlers: false }),
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

    if (newActive && newActive?.id != activeState?.id) {
      event.preventDefault();
      setActive(newActive);
      setFocusVisibleState(true);
    }

    onKeyDown?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocusedState(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocusedState(false);
    onBlur?.(event);
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
      const newOption = getOptionAtIndex(0);
      if (newOption) {
        setActive(newOption);
      }
    });
    onChange?.(event);
  };

  const handleListMouseOver = () => {
    setFocusVisibleState(false);
  };

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    // We check the active index because the active item may have been removed
    const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
    if (openState && activeIndex < 0) {
      if (openKey.current === "ArrowDown") {
        setActive(getOptionAtIndex(0));
      } else if (openKey.current === "ArrowUp") {
        setActive(getOptionAtIndex(options.length - 1));
      } else {
        if (selectedState.length > 0) {
          const selected = getOptionsMatching(
            (option) => option.value === selectedState[0]
          ).pop();
          if (selected) {
            setActive(selected);
          }
        } else {
          setActive(getOptionAtIndex(0));
        }
      }
    } else if (!openState) {
      setActive(undefined);
    }
  }, [openState, children]);

  const buttonId = useId();
  const listId = useId();

  return (
    <ListControlContext.Provider value={listControl}>
      <Input
        className={clsx(withBaseName(), className)}
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
          ...inputPropsProp,
        }}
        aria-activedescendant={activeState?.id}
        variant={variant}
        inputRef={inputRef}
        value={valueState}
        ref={handleRef}
        {...getReferenceProps({
          onBlur: handleBlur,
          onFocus: handleFocus,
          onKeyDown: handleKeyDown,
          ...rest,
        })}
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
        >
          {children}
        </OptionList>
      </FloatingComponent>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: ComboBoxNextProps<Item> & { ref?: Ref<HTMLDivElement> }
) => JSX.Element;
