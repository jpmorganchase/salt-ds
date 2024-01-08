import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  useEffect,
  FocusEvent,
  useRef,
} from "react";
import {
  ListControlProps,
  useListControl,
} from "../list-control/ListControlState";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import {
  makePrefixer,
  StatusAdornment,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useFormFieldProps,
  useId,
  ValidationStatus,
} from "@salt-ds/core";
import { flip, size } from "@floating-ui/react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dropdownCss from "./DropdownNext.css";
import { ListControlContext } from "../list-control/ListControlContext";
import { OptionList } from "../option/OptionList";

export interface DropdownNextProps
  extends Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue">,
    ListControlProps {
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
   * Validation status, one of "error" | "warning" | "success".
   */
  validationStatus?: Exclude<ValidationStatus, "info">;
}

function ExpandIcon({ open }: { open: boolean }) {
  return open ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />;
}

const withBaseName = makePrefixer("saltDropdownNext");

export const DropdownNext = forwardRef<HTMLButtonElement, DropdownNextProps>(
  function DropdownNext(props, ref) {
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
      defaultValue: defaultValueProp,
      value,
      onOpenChange,
      open,
      placeholder,
      startAdornment,
      required: requiredProp,
      variant = "primary",
      validationStatus: validationStatusProp,
      onClick,
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-DropdownNext",
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
      : undefined ?? requiredProp;

    const isEmptyReadOnly = readOnly && !defaultValueProp && !value;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultValueProp;

    const listControl = useListControl({
      open,
      defaultOpen,
      onOpenChange,
      multiselect,
      defaultSelected,
      selected,
      onSelectionChange,
      defaultValue,
      value,
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
      valueState,
      setFocusVisibleState,
      focusedState,
      setFocusedState,
      listRef,
    } = listControl;

    const { Component: FloatingComponent } = useFloatingComponent();

    const { x, y, strategy, elements, floating, reference } = useFloatingUI({
      open,
      placement: "bottom-start",
      middleware: [
        size({
          apply({ rects, elements, availableHeight }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
              maxHeight: `calc(${availableHeight}px - var(--salt-spacing-100))`,
              minHeight: `calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5)`,
            });
          },
        }),
        flip({ fallbackStrategy: "initialPlacement" }),
      ],
    });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const handleFloatingRef = useForkRef<HTMLButtonElement>(
      reference,
      buttonRef
    );
    const handleButtonRef = useForkRef(handleFloatingRef, ref);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!readOnly) {
        setFocusVisibleState(false);
        setOpen(event, !openState);
      }
      onClick?.(event);
    };

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
        setOpen(event, true);
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
          setOpen(event, true);
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

          if (!multiselect) {
            setOpen(event, false);
          }

          break;
        case "Escape":
          setOpen(event, false);
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

    const ignoreBlur = useRef(false);

    const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
      if (!ignoreBlur.current) {
        setOpen(event, false);
      }
      ignoreBlur.current = false;

      setFocusedState(false);
      onBlur?.(event);
    };

    const handleListMouseOver = () => {
      setFocusVisibleState(false);
    };

    const handleListMouseDown = () => {
      ignoreBlur.current = true;
    };

    const handleListFocus = () => {
      buttonRef.current?.focus();
    };
    const handleListClick = () => {
      buttonRef.current?.focus();
    };

    useEffect(() => {
      // We check the active index because the active item may have been removed
      const activeIndex = activeState ? getIndexOfOption(activeState) : -1;
      if (openState && activeIndex < 0) {
        if (openKey.current.key === "ArrowDown") {
          setActive(getOptionAtIndex(0));
        } else if (openKey.current.key === "ArrowUp") {
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

    const listId = useId();

    return (
      <>
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
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            role="combobox"
            type="button"
            disabled={disabled}
            aria-readonly={readOnly ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-expanded={openState}
            aria-activedescendant={activeState?.id}
            aria-labelledby={
              clsx(formFieldLabelledBy, ariaLabelledBy) || undefined
            }
            aria-describedby={
              clsx(formFieldDescribedBy, ariaDescribedBy) || undefined
            }
            aria-multiselectable={multiselect}
            aria-controls={openState ? listId : undefined}
            {...rest}
          >
            {startAdornment}
            <span
              className={clsx(withBaseName("content"), {
                [withBaseName("placeholder")]: !valueState,
              })}
            >
              {valueState ?? placeholder}
            </span>
            {validationStatus && <StatusAdornment status={validationStatus} />}
            {!readOnly && <ExpandIcon open={openState} />}
          </button>
          <FloatingComponent
            open={(openState || focusedState) && !readOnly}
            left={x ?? 0}
            top={y ?? 0}
            position={strategy}
            width={elements.floating?.offsetWidth}
            height={elements.floating?.offsetHeight}
            ref={floating}
            // style={floatingStyles}
          >
            <OptionList
              id={listId}
              collapsed={!openState}
              onMouseOver={handleListMouseOver}
              onMouseDown={handleListMouseDown}
              onFocus={handleListFocus}
              onClick={handleListClick}
              ref={listRef}
            >
              {children}
            </OptionList>
          </FloatingComponent>
        </ListControlContext.Provider>
      </>
    );
  }
);
