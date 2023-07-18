import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent, useRef,
  useState
} from "react";
import {
  FormFieldLabel,
  Input, InputProps,
  makePrefixer,
  SaltProvider,
  UseFloatingUIProps,
  useForkRef,
  useId
} from "@salt-ds/core";
import {ListItemNext, ListNext, ListNextProps} from "../list-next";
import {FloatingPortal} from "@floating-ui/react";
import {useComboBox} from "./useComboBox";
import {useWindow} from "@salt-ds/window";
import {useComponentCssInjection} from "@salt-ds/styles";
import comboBoxCss from "./comboBoxNext.css";
import {ComboBoxContext} from "./ComboBoxContext";
import {Highlighter} from "../list";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps<T, Item = string> extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">, HTMLAttributes<HTMLElement> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  listId?: string;
  defaultValue?: string;
  value?: string;
  source: T | T[] | string[]; // TODO: check type
  InputProps?: InputProps;
  ListProps?: ListNextProps;
  getFilterRegex?: (inputValue: string) => RegExp;
  stringToItem?: (value?: string) => Item | null | undefined;
}

const defaultStringToItem = (source, value, handleSelect) =>  {
  if (!source) return null;
  return source && source.map((item, index) => {
    return <ListItemNext key={index} value={item}
                         onClick={() => handleSelect(item)}
    >
      <Highlighter matchPattern={value || null} text={item}/>
    </ListItemNext>
  })
}

const defaultFilter = (source, value) => source.filter(listItem => listItem.toLowerCase().includes(value.toLowerCase()))


export const ComboBoxNext = forwardRef<HTMLElement, ComboBoxNextProps>(
  function ComboBoxNext(
    {
      children,
      InputProps,
      ListProps,
      disabled,
      listId: listIdProp,
      placement,
      onFocus,
      onKeyDown,
      onChange,
      onBlur,
      onSelect,
      source,
      stringToItem= defaultStringToItem,
      getFilterRegex,
      ...rest
    }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-combo-box-next",
      css: comboBoxCss,
      window: targetWindow,
    });
    // TODO: expose whatever needed
    const listId = useId(listIdProp);
    const listRef = useRef();
    const comboBoxId = 'comboBoxId';
    const comboBoxAriaLabel = 'comboboxlabel'

    const {
      focusHandler,
      keyDownHandler,
      changeHandler,
      blurHandler,
      contextValue,
      open,
      value,
      selected,
      selectHandler,
      highlightedIndex,
      floating,
      reference,
      getTriggerProps,
      getPortalProps,
    } = useComboBox(
      {children, placement}
    );

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      focusHandler();
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      keyDownHandler(event);
      onKeyDown?.(event);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      changeHandler(event);
      onChange?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      blurHandler();
      onBlur?.(event);
    };

    const handleSelect = (item) => {
      console.log('selected', item);
      selectHandler(item)
    };

    const filteredSource = defaultFilter(source, value);
    console.log(filteredSource.length)
    const triggerRef = useForkRef(ref, reference);
    const floatingRef = useForkRef(listRef, floating);
    return (
      <ComboBoxContext.Provider value={contextValue}>
        <>
          <Input
            disabled={disabled}
            // TODO: split this into change and keydown
            onKeyDown={handleKeyDown}
            value={value}
            aria-controls={listId}
            aria-expanded={open}
            aria-haspopup="listbox"
            id={comboBoxId}
            role="combobox"
            onChange={handleChange}
            {...getTriggerProps()}
            inputProps={
              {
                'aria-describedby': comboBoxAriaLabel,
                tabIndex: disabled ? -1 : 0,
                onFocus: handleFocus,
                onKeyDown: handleKeyDown,
                onBlur: handleBlur
              }}
            inputRef={triggerRef}
          />
          {/*  TODO: widths, heights, positioning of the portal/ list*/}
          {/* The provider is needed to support the use case where an app has nested modes. The element that is portalled needs to have the same style as the current scope */}
          {open && !disabled && filteredSource.length > 0 && (
            // TODO: do we need the provider here aswell? copying from tooltip
            <FloatingPortal>
              <SaltProvider>
                <ListNext
                  id={listId}
                  highlightedIndex={highlightedIndex}
                  selected={selected}
                  disabled={disabled}
                  role="listbox" aria-labelledby={comboBoxAriaLabel}
                  tabIndex={-1}
                  ref={floatingRef}
                  {...getPortalProps()}>
                  {stringToItem(filteredSource, value, handleSelect)}
                </ListNext>
              </SaltProvider>
            </FloatingPortal>

          )}
        </>
      </ComboBoxContext.Provider>)
  });
