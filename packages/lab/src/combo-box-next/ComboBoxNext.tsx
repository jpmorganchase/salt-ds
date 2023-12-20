import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
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
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { ListControlProps } from "../list-control/ListControlState";
import { ListControlContext } from "../list-control/ListControlContext";
import { clsx } from "clsx";
import { flip, size } from "@floating-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { useComboBoxNext } from "./useComboBoxNext";
import { OptionList } from "../option/OptionList";

export interface ComboBoxNextProps
  extends InputProps,
    Omit<ListControlProps, "value" | "defaultValue"> {
  /**
   * The options to display in the combo box.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltComboBoxNext");

export const ComboBoxNext = forwardRef<HTMLDivElement, ComboBoxNextProps>(
  function ComboBox(props, ref) {
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

    const listControl = useComboBoxNext({
      open,
      defaultOpen,
      onOpenChange,
      multiselect,
      defaultSelected,
      selected,
      onSelectionChange,
      value,
      defaultValue,
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

    const { x, y, strategy, elements, floating, reference } = useFloatingUI({
      open,
      placement: "bottom-start",
      middleware: [
        size({
          apply({ rects, elements, availableHeight }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
              maxHeight: `${availableHeight}px`,
            });
          },
        }),
        flip({
          fallbackStrategy: "initialPlacement",
        }),
      ],
    });

    const handleRef = useForkRef<HTMLDivElement>(reference, ref);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!readOnly) {
        event.stopPropagation();
        setFocusVisibleState(false);
        setOpen(event, !openState);
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
          setOpen(event, true);
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

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocusedState(true);

      onFocus?.(event);
    };

    const ignoreBlur = useRef(false);

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (!ignoreBlur.current) {
        setOpen(event, false);
      }
      ignoreBlur.current = false;

      setFocusedState(false);
      onBlur?.(event);
    };

    const handleClick = (event: MouseEvent<HTMLInputElement>) => {
      if (!readOnly) {
        setOpen(event, true);
      }

      onClick?.(event);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!openState) {
        setOpen(event, true);
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

    const handleListMouseDown = () => {
      ignoreBlur.current = true;
    };

    const handleListFocus = () => {
      inputRef.current?.focus();
    };

    const handleListClick = () => {
      inputRef.current?.focus();
    };

    useEffect(() => {
      if (openState && !activeState) {
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
          onClick={handleClick}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
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
          {...rest}
          ref={handleRef}
        />
        <FloatingComponent
          open={(openState || focusedState) && !readOnly}
          left={x}
          top={y}
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
            onMouseDown={handleListMouseDown}
            onFocus={handleListFocus}
            onClick={handleListClick}
          >
            {children}
          </OptionList>
        </FloatingComponent>
      </ListControlContext.Provider>
    );
  }
);
