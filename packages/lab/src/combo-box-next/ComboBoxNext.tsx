import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLAttributes, KeyboardEvent, MouseEvent,
  useRef,
  useState
} from "react";
import {
  FormField,
  FormFieldLabel,
  Input, makePrefixer, useForkRef, useId
} from "@salt-ds/core";
import {ListNext} from "../list-next";
import {FloatingPortal} from "@floating-ui/react";
import {useComboBox} from "./useComboBox";
import {useWindow} from "@salt-ds/window";
import {useComponentCssInjection} from "@salt-ds/styles";
import comboBoxCss from "./comboBoxNext.css";
import {ComboBoxContext} from "./ComboBoxContext";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps extends HTMLAttributes<HTMLElement> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  listId?: string;
}

export const ComboBoxNext = forwardRef<HTMLElement, ComboBoxNextProps>(
  function ComboBoxNext({
                          children,
                          disabled,
                          listId: listIdProp,
                        }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-combo-box-next",
      css: comboBoxCss,
      window: targetWindow,
    });

    // TODO: expose whatever needed
    const listId = useId(listIdProp);
    const comboBoxId = 'comboBoxId';
    const comboBoxAriaLabel = 'comboboxlabel'

    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      contextValue,
      expanded,
      value
    } = useComboBox(
      {children}
    );

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      focusHandler();
      // onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      keyDownHandler(event);
      // onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      blurHandler();
      // onBlur?.(event);
    };

    const selected = undefined;
    return (
      <ComboBoxContext.Provider value={contextValue}>
        <div ref={ref}>

        <FormFieldLabel>
          Select
        </FormFieldLabel>
        <Input onFocus={handleFocus}
               disabled={disabled}
               onBlur={handleBlur}
               // TODO: split this into change and keydown
               onChange={handleKeyDown}
               onKeyDown={handleKeyDown}
               value={value}
               aria-controls={listId}
               aria-expanded={expanded}
               aria-haspopup="listbox"
               aria-labelledby={comboBoxAriaLabel}
               id={comboBoxId}
               role="combobox"
               tabIndex={disabled ? -1 : 0}
        />
        {/*  TODO: widths, heights, positioning of the portal/ list*/}
        {expanded &&
          <FloatingPortal>
          <ListNext
                    id={listId}
                    disabled={disabled}
                    filter={value}
                    role="listbox" aria-labelledby={comboBoxAriaLabel}
                    tabIndex={-1}>
            {children}
          </ListNext>
          </FloatingPortal>
        }
      </div>
      </ComboBoxContext.Provider>)
  });
