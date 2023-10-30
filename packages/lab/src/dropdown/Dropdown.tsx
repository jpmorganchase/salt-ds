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
} from "@salt-ds/core";
import { flip, offset, shift, limitShift, size } from "@floating-ui/react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dropdownCss from "./Dropdown.css";
import { ListControlContext } from "../list-control/ListControlContext";

export interface DropdownProps
  extends Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue">,
    ListControlProps {
  disabled?: boolean;
  readOnly?: boolean;
  children?: ReactNode;
  multiselect?: boolean;
  placeholder?: string;
  required?: boolean;
  variant?: "primary" | "secondary";
  validationStatus?: "error" | "warning" | "success";
}

function ExpandIcon({ open }: { open: boolean }) {
  return open ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />;
}

const withBaseName = makePrefixer("saltDropdown");

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  function Dropdown(props, ref) {
    const {
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      children,
      className,
      disabled: disabledProp,
      readOnly: readOnlyProp,
      multiselect,
      onSelectionChange,
      selected,
      defaultSelected,
      defaultOpen,
      defaultValue,
      value,
      onOpenChange,
      open,
      placeholder,
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
      : undefined ?? requiredProp;

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

    const { x, y, strategy, elements, floating, reference, refs } =
      useFloatingUI({
        open,
        placement: "bottom-start",
        middleware: [
          offset(0),
          size({
            apply({ rects, elements, availableHeight }) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
                maxHeight: `${availableHeight}px`,
              });
            },
          }),
          flip(),
          shift({ limiter: limitShift() }),
        ],
      });

    const buttonRef = useForkRef<HTMLButtonElement>(reference, ref);

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

      if (openState && event.key === "ArrowUp" && event.altKey) {
        if (activeState) {
          select(event, activeState);
        }
        event.preventDefault();
        setOpen(event, false);
      }

      if (
        (event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey) ||
        (event.key === " " && typeaheadString.current.length > 0)
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleTypeahead(event);
        return;
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

    const handleListClick = () => {
      refs.reference.current?.focus();
    };

    useEffect(() => {
      if (openState && !activeState) {
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
      } else if (!openState) {
        setActive(undefined);
      }
    }, [openState, children]);

    const listId = useId();
    const handleListRef = useForkRef<HTMLDivElement>(floating, listRef);

    return (
      <div
        className={clsx(withBaseName(), withBaseName(variant), {
          [withBaseName("disabled")]: disabled,
          [withBaseName(validationStatus ?? "")]: validationStatus,
        })}
      >
        <ListControlContext.Provider value={listControl}>
          <button
            className={clsx(withBaseName("button"), className)}
            ref={buttonRef}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            role="combobox"
            disabled={disabled}
            aria-readonly={readOnly ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-expanded={openState}
            aria-activedescendant={activeState?.id}
            aria-labelledby={clsx(formFieldLabelledBy, ariaLabelledBy)}
            aria-describedby={clsx(formFieldDescribedBy, ariaDescribedBy)}
            aria-multiselectable={multiselect}
            aria-controls={openState ? listId : undefined}
            {...rest}
          >
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
            open={openState || focusedState}
            left={x ?? 0}
            top={y ?? 0}
            position={strategy}
            width={elements.floating?.offsetWidth}
            height={elements.floating?.offsetHeight}
            ref={handleListRef}
            role="listbox"
            id={listId}
            className={clsx(withBaseName("list"), {
              [withBaseName("listCollapsed")]: !openState,
            })}
            onMouseOver={handleListMouseOver}
            onMouseDown={handleListMouseDown}
            onClick={handleListClick}
          >
            {children}
          </FloatingComponent>
        </ListControlContext.Provider>
      </div>
    );
  }
);
