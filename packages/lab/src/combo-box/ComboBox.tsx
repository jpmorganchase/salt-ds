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
  useId,
} from "@salt-ds/core";
import {
  ListControlProps,
  useListControl,
} from "../list-control/ListControlState";
import { ListControlContext } from "../list-control/ListControlContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxCss from "./ComboBox.css";
import { clsx } from "clsx";
import { flip, limitShift, offset, shift, size } from "@floating-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";

export interface ComboBoxProps
  extends InputProps,
    Omit<ListControlProps, "value" | "defaultValue"> {
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltComboBox");

export const ComboBox = forwardRef<HTMLDivElement, ComboBoxProps>(
  function ComboBox(props, ref) {
    const {
      children,
      className,
      disabled,
      readOnly,
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
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-combo-box",
      css: comboBoxCss,
      window: targetWindow,
    });

    const listControl = useListControl({
      open,
      defaultOpen,
      onOpenChange,
      multiselect,
      defaultSelected,
      selected,
      onSelectionChange,
    });

    const {
      activeState,
      setActive,
      openState,
      setOpen,
      getOptionAtIndex,
      getIndexOfOption,
      getOptionsMatching,
      options,
      selectedState,
      select,
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
                maxHeight: `calc(${availableHeight}px - var(--salt-spacing-100))`,
              });
            },
          }),
          flip({
            fallbackStrategy: "initialPlacement",
          }),
          shift({ limiter: limitShift() }),
        ],
      });

    const handleRef = useForkRef<HTMLDivElement>(reference, ref);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!readOnly) {
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

      if (openState && event.key === "ArrowUp" && event.altKey) {
        if (activeState) {
          select(event, activeState);
        }
        event.preventDefault();
        setOpen(event, false);
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
          // case " ":
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

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!openState) {
        setOpen(event, true);
      }
      onChange?.(event);
    };

    const handleListMouseOver = () => {
      setFocusVisibleState(false);
    };

    const handleListMouseDown = () => {
      ignoreBlur.current = true;
    };

    const handleListClick = () => {
      inputRef.current?.focus();
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
      <ListControlContext.Provider value={listControl}>
        <Input
          className={clsx(withBaseName(), className)}
          endAdornment={
            !readOnly ? (
              <Button
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
            ) : undefined
          }
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
          {...rest}
          ref={handleRef}
        />
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
    );
  }
);
