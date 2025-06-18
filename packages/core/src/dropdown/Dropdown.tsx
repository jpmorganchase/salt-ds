import {
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useFocus,
  useInteractions,
} from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import {
  ListControlContext,
  type OptionValue,
} from "../list-control/ListControlContext";
import {
  defaultValueToString,
  type ListControlProps,
  useListControl,
} from "../list-control/ListControlState";
import { OptionList } from "../option/OptionList";
import { useIcon } from "../semantic-icon-provider";
import { StatusAdornment } from "../status-adornment";
import type { ValidationStatus } from "../status-indicator";
import {
  makePrefixer,
  type UseFloatingUIProps,
  useFloatingUI,
  useForkRef,
  useId,
} from "../utils";
import dropdownCss from "./Dropdown.css";

export type DropdownProps<Item = string> = {
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
  /** Styling variant with full border. Defaults to false
   */
  bordered?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue"> &
  ListControlProps<Item>;

const withBaseName = makePrefixer("saltDropdown");

function ExpandIcon({ open }: { open: boolean }) {
  const { CollapseIcon, ExpandIcon } = useIcon();
  return open ? (
    <CollapseIcon className={withBaseName("toggle")} aria-hidden />
  ) : (
    <ExpandIcon className={withBaseName("toggle")} aria-hidden />
  );
}

export const Dropdown = forwardRef(function Dropdown<Item>(
  props: DropdownProps<Item>,
  ref: ForwardedRef<HTMLButtonElement>,
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
    bordered = false,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dropdown",
    css: dropdownCss,
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
    : requiredProp;
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
    : (value ?? selectedValue);

  const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
    newOpen,
    _event,
    reason,
  ) => {
    const focusNotBlur = reason === "focus" && newOpen;
    if (readOnly || focusNotBlur) return;
    setOpen(newOpen);
  };

  const { x, y, strategy, elements, floating, reference, context } =
    useFloatingUI({
      open: openState && !readOnly && Children.count(children) > 0,
      onOpenChange: handleOpenChange,
      placement: "bottom-start",
      middleware: [
        offset(1),
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
    onKeyDown?.(event);

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

    if (newActive && newActive.data.id !== activeState?.id) {
      event.preventDefault();
      setActive(newActive.data);
      setFocusVisibleState(true);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusedState(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusedState(false);
    if (!listRef.current || !listRef.current.contains(event.relatedTarget)) {
      onBlur?.(event);
    }
  };

  const handleListMouseOver = () => {
    setFocusVisibleState(false);
  };

  const handleFocusButton = () => {
    buttonRef.current?.focus();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run when the list's openState or the displayed options change.
  useEffect(() => {
    // If the list is closed we should clear the active item
    if (!openState) {
      setActive(undefined);
      return;
    }

    // We check the active index because the active item may have been removed
    const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
    let newActive;

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

    // If we still don't have an active item, we should check if the list has been opened with the keyboard
    if (!newActive) {
      if (openKey.current === "ArrowDown") {
        newActive = getFirstOption();
      } else if (openKey.current === "ArrowUp") {
        newActive = getLastOption();
      }
    }

    // If we still don't have an active item, we should just select the first item
    if (!newActive) {
      newActive = getFirstOption();
    }

    setActive(newActive?.data);
  }, [openState, children]);

  const listId = useId();

  const handleListRef = useForkRef<HTMLDivElement>(listRef, floating);

  return (
    <ListControlContext.Provider value={listControl}>
      <button
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName(validationStatus ?? "")]: validationStatus,
            [withBaseName("bordered")]: bordered,
          },
          className,
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
        aria-controls={openState ? listId : undefined}
        {...getReferenceProps({
          onKeyDown: handleKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...rest,
        })}
      >
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <span
          className={clsx(withBaseName("content"), {
            [withBaseName("placeholder")]: !valueText,
          })}
        >
          {!valueText ? placeholder : valueText}
        </span>
        {!disabled && validationStatus && (
          <StatusAdornment status={validationStatus} />
        )}
        {!readOnly && <ExpandIcon open={openState} />}
        <div className={withBaseName("activationIndicator")} />
      </button>
      <OptionList
        aria-multiselectable={multiselect}
        open={
          (openState || focusedState) &&
          !readOnly &&
          Children.count(children) > 0
        }
        {...getFloatingProps({
          onMouseOver: handleListMouseOver,
          onFocus: handleFocusButton,
          onClick: handleFocusButton,
        })}
        left={x ?? 0}
        top={y ?? 0}
        position={strategy}
        width={elements.floating?.offsetWidth}
        height={elements.floating?.offsetHeight}
        ref={handleListRef}
        id={listId}
        collapsed={!openState}
      >
        {children}
      </OptionList>
    </ListControlContext.Provider>
  );
}) as <Item = string>(
  props: DropdownProps<Item> & { ref?: Ref<HTMLButtonElement> },
) => JSX.Element;
