import { clsx } from "clsx";
import { ListNext, ListNextProps } from "@salt-ds/lab";
import { makePrefixer, useId, useForkRef } from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";
import {
  useRef,
  forwardRef,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useWindow } from "@salt-ds/window";
import dropdownNextCss from "./DropdownNext.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { DropdownNextContext } from "./DropdownNextContext";
import { FloatingPortal } from "@floating-ui/react";
import { useDropdownNext } from "./useDropdownNext";

const withBaseName = makePrefixer("saltDropdownNext");

export interface DropdownNextProps extends HTMLAttributes<HTMLElement> {
  /**
   * If true, dropdown will be disabled.
   */
  disabled?: boolean;
  /**
   * Initially selected value for the dropdown.
   */
  defaultSelected?: string;
}

export const DropdownNext = forwardRef<HTMLDivElement, DropdownNextProps>(
  function DropdownNext(
    { children, className, disabled, id, defaultSelected, ...rest },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dropdown-next",
      css: dropdownNextCss,
      window: targetWindow,
    });

    const dropdownId = useId(id);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef<HTMLDivElement>(dropdownRef, ref);

    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseDownHandler,
      listExpanded,
      setListExpanded,
      contextValue,
      valueSelected,
      setValueSelected,
    } = useDropdownNext({
      children,
    });

    // TODO: do we want list to open on DD focus??
    const handleFocus = (event: FocusEvent<HTMLElement>) => {
      focusHandler();
      // onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      keyDownHandler(event);
      // onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLElement>) => {
      blurHandler();
      // onBlur?.(event);
    };

    const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
      mouseDownHandler();
      // onMouseDown?.(event);
    };

    const handleListMouseDown = (event: MouseEvent<HTMLElement>) => {
      setValueSelected(event.target.dataset.value);
      setListExpanded(false);
      // onSelect?.(event.target.dataset.value);
    };

    const getDropdownDisplayText = () => {
      if (valueSelected?.length > 0) return valueSelected;
      if (defaultSelected) return defaultSelected;

      return "Select an option";
    };

    return (
      <DropdownNextContext.Provider value={contextValue}>
        <div
          className={clsx(withBaseName(), className)}
          ref={handleRef}
          id={dropdownId}
          aria-disabled={disabled}
          {...rest}
        >
          <button
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            value={valueSelected}
            className="dropdown-next-button"
            aria-haspopup="listbox"
            aria-expanded={listExpanded}
            aria-labelledby={"dropdownLabel"}
            tabIndex={disabled ? -1 : 0}
          >
            {getDropdownDisplayText()}
            <ChevronDownIcon />
          </button>
          {listExpanded && (
            // TODO: fix portal position
            <FloatingPortal>
              <ListNext
                className="dropdown-next-menu"
                aria-labelledby={"dropdownLabel"}
                disabled={disabled}
                onMouseDown={handleListMouseDown}
              >
                {children}
              </ListNext>
            </FloatingPortal>
          )}
        </div>
      </DropdownNextContext.Provider>
    );
  }
);
