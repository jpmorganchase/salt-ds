import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  KeyboardEvent,
  useEffect,
  FocusEvent,
  useRef,
  ForwardedRef,
  Ref,
} from "react";
import {
  ListControlProps,
  useListControl,
  defaultValueToString,
} from "../list-control/ListControlState";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import {
  makePrefixer,
  StatusAdornment,
  useFloatingComponent,
  useFloatingUI,
  UseFloatingUIProps,
  useForkRef,
  useFormFieldProps,
  useId,
  ValidationStatus,
} from "@salt-ds/core";
import {
  flip,
  size,
  useClick,
  useDismiss,
  useFocus,
  useInteractions,
} from "@floating-ui/react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dropdownNextCss from "./DropdownNext.css";
import { ListControlContext } from "../list-control/ListControlContext";
import { OptionList } from "../option/OptionList";

export type DropdownNextProps<Item = string> = {
  /**
   * If `true`, the dropdown will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the dropdown will be read-only.
   */
  readOnly?: boolean;
  /**
   * The options to display in the dropdown.
   */
  children?: ReactNode;
  /**
   * The marker to use in an empty read only dropdown.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * If `true`, the dropdown will be multiselect.
   */
  multiselect?: boolean;
  /**
   * The text shown when the dropdown has no value.
   */
  placeholder?: string;
  /**
   * If `true`, the dropdown will be required.
   */
  required?: boolean;
  /**
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * The content of the dropdown shown in the button. The component will be controlled if this prop is provided.
   */
  value?: string;
  /**
   * Validation status, one of "error" | "warning" | "success".
   */
  validationStatus?: Exclude<ValidationStatus, "info">;
} & Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue"> &
  ListControlProps<Item>;

function ExpandIcon({ open }: { open: boolean }) {
  return open ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />;
}

const withBaseName = makePrefixer("saltDropdownNext");

export const DropdownNext = forwardRef(function DropdownNext<Item>(
  props: DropdownNextProps<Item>,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const {
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    children,
    className,
    disabled: disabledProp,
    emptyReadOnlyMarker = "—",
    readOnly: readOnlyProp,
    multiselect,
    onSelectionChange,
    selected,
    defaultSelected,
    defaultOpen,
    value,
    onOpenChange,
    open,
    placeholder,
    startAdornment,
    required: requiredProp,
    variant = "primary",
    validationStatus: validationStatusProp,
    onKeyDown,
    onFocus,
    onBlur,
    valueToString = defaultValueToString,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dropdown-next",
    css: dropdownNextCss,
    window: targetWindow,
  });

  const {
    a11yProps: {
      "aria-describedby": formFieldDescribedBy,
      "aria-labelledby": formFieldLabelledBy,
    } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    necessity: formFieldRequired,
    validationStatus: formFieldValidationStatus,
  } = useFormFieldProps();

  const disabled = Boolean(disabledProp) || formFieldDisabled;
  const readOnly = Boolean(readOnlyProp) || formFieldReadOnly;
  const validationStatus = validationStatusProp ?? formFieldValidationStatus;
  const required = formFieldRequired
    ? ["required", "asterisk"].includes(formFieldRequired)
    : undefined ?? requiredProp;
  const listControl = useListControl<Item>({
    open,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected,
    onSelectionChange,
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
    getOptionFromSearch,
    options,
    selectedState,
    select,
    setFocusVisibleState,
    focusedState,
    setFocusedState,
    listRef,
  } = listControl;

  const selectedValue = selectedState
    .map((item) => valueToString(item))
    .join(", ");
  const isEmptyReadOnly = readOnly && selectedValue === "";
  const valueText = isEmptyReadOnly
    ? emptyReadOnlyMarker
    : value ?? selectedValue;

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
              maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
            });
          },
        }),
        flip({ fallbackStrategy: "initialPlacement" }),
      ],
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useFocus(context),
    useClick(context),
  ]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleTriggerRef = useForkRef<HTMLButtonElement>(reference, buttonRef);
  const handleButtonRef = useForkRef(handleTriggerRef, ref);

  const typeaheadString = useRef("");
  const typeaheadTimeout = useRef<number | undefined>();

  const handleTypeahead = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (typeaheadTimeout.current) {
      clearTimeout(typeaheadTimeout.current);
    }
    typeaheadString.current += event.key;
    typeaheadTimeout.current = window.setTimeout(() => {
      typeaheadString.current = "";
    }, 500);

    if (!openState) {
      setOpen(true, "input");
    }

    let newOption = getOptionFromSearch(typeaheadString.current, activeState);

    if (!newOption) {
      newOption = getOptionFromSearch(typeaheadString.current);
    }

    if (newOption) {
      setActive(newOption);
      setFocusVisibleState(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
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
      case " ":
        if (
          (openState && Boolean(activeState?.disabled)) ||
          (typeaheadString.current.trim().length > 0 && event.key === " ")
        ) {
          event.preventDefault();
          return;
        }

        if (!openState || !activeState) {
          return;
        }

        event.preventDefault();
        select(event, activeState);

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

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusedState(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusedState(false);
    onBlur?.(event);
  };

  const handleListMouseOver = () => {
    setFocusVisibleState(false);
  };

  const handleFocusButton = () => {
    buttonRef.current?.focus();
  };

  useEffect(() => {
    // We check the active index because the active item may have been removed
    const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
    let newActive = undefined;

    // If the active item is still in the list, we don't need to do anything
    if (activeIndex > 0) {
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
      } else if (openKey.current === "ArrowUp") {
        newActive = getOptionAtIndex(options.length - 1);
      }
    }

    // If we still don't have an active item, we should just select the first item
    if (!newActive) {
      newActive = getOptionAtIndex(0);
    }

    setActive(newActive);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- We only want this to run when the list's openState or the displayed options change */
  }, [openState, children]);

  const listId = useId();

  return (
    <ListControlContext.Provider value={listControl}>
      <button
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName(validationStatus ?? "")]: validationStatus,
          },
          className
        )}
        ref={handleButtonRef}
        role="combobox"
        type="button"
        disabled={disabled}
        aria-readonly={readOnly ? "true" : undefined}
        aria-required={required ? "true" : undefined}
        aria-expanded={openState}
        aria-activedescendant={activeState?.id}
        aria-labelledby={clsx(formFieldLabelledBy, ariaLabelledBy) || undefined}
        aria-describedby={
          clsx(formFieldDescribedBy, ariaDescribedBy) || undefined
        }
        aria-multiselectable={multiselect}
        aria-controls={openState ? listId : undefined}
        {...getReferenceProps({
          onKeyDown: handleKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...rest,
        })}
      >
        {startAdornment}
        <span
          className={clsx(withBaseName("content"), {
            [withBaseName("placeholder")]: !valueText,
          })}
        >
          {!valueText ? placeholder : valueText}
        </span>
        {validationStatus && <StatusAdornment status={validationStatus} />}
        {!readOnly && <ExpandIcon open={openState} />}
      </button>
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
          id={listId}
          collapsed={!openState}
          onMouseOver={handleListMouseOver}
          onFocus={handleFocusButton}
          onClick={handleFocusButton}
          ref={listRef}
        >
          {children}
        </OptionList>
      </FloatingComponent>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: DropdownNextProps<Item> & { ref?: Ref<HTMLButtonElement> }
) => JSX.Element;
