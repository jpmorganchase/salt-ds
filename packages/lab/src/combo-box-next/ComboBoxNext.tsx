import {forwardRef, InputHTMLAttributes, ReactNode, Ref, useRef} from "react";
import {Input, makePrefixer, useForkRef, useId} from "@salt-ds/core";
import {ListItemNext, ListNext, ListNextProps} from "../list-next";
import {FloatingPortal} from "@floating-ui/react";
import {useComboBox} from "./useComboBox";
import {useWindow} from "@salt-ds/window";
import {useComponentCssInjection} from "@salt-ds/styles";
import comboBoxCss from "./comboBoxNext.css";
import {Highlighter} from "../list";
import {ChevronDownIcon} from "@salt-ds/icons";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps {
  /**
   * If true, all items in list will be disabled.
   */
  disabled: boolean;
  listId?: string;
  defaultValue?: string;
  defaultSelected?: string;
  // value?: string;
  /**
   * The source of combobox items.
   */
  source: string[];
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  ListProps?: ListNextProps;
  // matchPattern?: RegExp | string;
  itemRenderer?: (value?: string, matchPattern?: string) => ReactNode | null | undefined;
  itemFilter?: (source: string[], filterValue?: string) => string[]
}

const defaultFilter = (source: string[], filterValue?: string) => source.filter(item => !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase()))
const defaultItemRenderer = (value: string, matchPattern?: RegExp | string) =>
  <ListItemNext value={value}><Highlighter matchPattern={matchPattern}
                                           text={value}/></ListItemNext>

export const ComboBoxNext = forwardRef<HTMLElement, ComboBoxNextProps>(
  function ComboBoxNext(
    {
      // children,
      // InputProps,
      ListProps,
      disabled,
      listId: listIdProp,
      // placement,
      // onFocus,
      defaultSelected,
      // onKeyDown,
      // onChange,
      // onBlur,
      // onSelect,
      source,
      defaultValue,
      inputProps = {},
      itemRenderer = defaultItemRenderer,
      itemFilter = defaultFilter,
      // // stringToItem= defaultStringToItem,
      // matchPattern,
      ...rest
    }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-combo-box-next",
      css: comboBoxCss,
      window: targetWindow,
    });
    const listId = useId(listIdProp);
    const listRef = useRef<HTMLUListElement>(null);

    // HOOK
    const {
      // input state
      value,
      setValue,
      // portal
      open,
      setOpen,
      reference,
      getTriggerProps,
      getPortalProps,
      // list
      selectedItem,
      highlightedIndex,
      activeDescendant,
      setListRef,
      keyDownHandler,
      focusHandler,
      changeHandler
    } = useComboBox({
      disabled,
      defaultSelected,
      listId,
      listRef,
      defaultValue
    });

    // floating references
    const triggerRef = useForkRef(ref, reference);
    // const floatingRef = useForkRef(listRef, setListRef);

    const filteredSource = itemFilter(source, value);
    console.log(highlightedIndex, activeDescendant, selectedItem)

    return (
      <>
        <Input
          endAdornment={<ChevronDownIcon/>}
          disabled={disabled}
          // // TODO: split this into change and keydown
          // onKeyDown={handleKeyDown}
          value={value}
          // aria-controls={listId}
          // aria-expanded={open}
          // aria-haspopup="listbox"
          // id={comboBoxId}
          role="combobox"
          onChange={changeHandler}
          {...getTriggerProps()}
          inputProps={
            {
              "aria-expanded": open,
              // 'aria-describedby': comboBoxAriaLabel,
              //
              tabIndex: disabled ? -1 : 0,
              onFocus: focusHandler,
              onKeyDown: keyDownHandler,
              // onBlur: handleBlur
            }}
          inputRef={triggerRef}

        />
        <FloatingPortal>
          {/* TODO: do we need salt provider here?*/}
          <div {...getPortalProps()}>
            <ListNext selected={selectedItem}
                      highlightedIndex={highlightedIndex}
                      ref={listRef}{...ListProps} disableFocus
            >
              {
                filteredSource.map((itemValue, index) => {
                  return itemRenderer(itemValue, value)
                  // onClick={() => handleSelect(item)}
                })
              }
            </ListNext>
          </div>
        </FloatingPortal>

      </>
    )
  });
