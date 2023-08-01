import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SyntheticEvent,
  useRef,
} from "react";
import {
  Button,
  Input,
  makePrefixer,
  SaltProvider,
  useForkRef,
  useId,
} from "@salt-ds/core";
import { ListNext, ListNextProps } from "../list-next";
import { FloatingPortal, Placement } from "@floating-ui/react";
import { useComboBox } from "./useComboBox";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxNextCss from "./ComboBoxNext.css";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { defaultFilter, defaultItemRenderer } from "./utils";
import { clsx } from "clsx";
import { UsePortalProps } from "./useComboboxPortal";
import { UseListProps } from "../list-next/useList";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps extends UseListProps {
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  InputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Additional props for the list component.
   */
  ListProps?: ListNextProps;
  /**
   * Additional props for the portal.
   */
  PortalProps?: UsePortalProps;
  /**
   * Placement of the List, default is 'bottom'
   */
  placement?: Placement;
  /**
   * If `true`, the component will be disabled.
   */
  disabled: boolean;
  /**
   * Function that takes a string input and returns a regex that can be used for filtering list.
   */
  // TODO: rename this prop?
  filterRegex?: () => void;
  comboBoxId?: string;
  defaultValue?: string;
  defaultSelected?: string;
  value?: string;
  /**
   * The source of combobox items.
   */
  source: string[];

  /**
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the list component
   */
  listRef?: Ref<HTMLUListElement>;
  itemRenderer?: (
    key: number,
    value?: string,
    matchPattern?: string
  ) => ReactNode | null | undefined;
  itemFilter?: (source: string[], filterValue?: string) => string[];
  /* Callback for change event. */
  onChange?: (event: SyntheticEvent, data: { value: string }) => void;
  // onFocus?:
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
}
const matchingItem = (input: string, value: string) =>
  input.toLowerCase().includes(value.toLowerCase());

export const ComboBoxNext = forwardRef<HTMLElement, ComboBoxNextProps>(
  function ComboBoxNext(
    {
      InputProps = {},
      ListProps,
      PortalProps,
      disabled,
      // placement,
      // onFocus,
      filterRegex,
      highlightedItem: highlightedItemProp,
      selected,
      defaultSelected,
      // onKeyDown,
      onChange,
      // onBlur,
      // onSelect,
      source,
      defaultValue,
      itemRenderer = defaultItemRenderer,
      itemFilter = defaultFilter,
      variant = "primary",
      // // stringToItem= defaultStringToItem,
      matchPattern = matchingItem,
      readOnly,

      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-combo-box-next",
      css: comboBoxNextCss,
      window: targetWindow,
    });
    const listId = useId(ListProps?.id);
    const listRef = useRef<HTMLUListElement>(null);

    const listProps = {
      highlightedItem: highlightedItemProp,
      selected,
      defaultSelected,
      onChange,
      id: listId,
      ref: listRef,
    };

    // HOOK
    const {
      // portal
      portalProps,
      // list
      selectedItem,
      highlightedItem,
      activeDescendant,
      focusVisibleRef,
      keyDownHandler,
      focusHandler,
      blurHandler,
      setSelectedItem,
      setHighlightedItem,
      mouseOverHandler,
    } = useComboBox({
      disabled,
      defaultSelected,
      listId,
      listRef,
      onChange,
      defaultValue,
      // for portal
      listProps,
      PortalProps,
    });

    const { open, floating, reference, getTriggerProps, getPortalProps } =
      portalProps;

    // floating references
    const triggerRef = useForkRef(ref, reference);
    const inputRef = useForkRef(triggerRef, focusVisibleRef);

    const filteredSource = source && itemFilter(source, selectedItem);

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedItem(value);
      if (value === "") {
        setHighlightedItem(undefined);
      } else {
        const firstMatchingItem = filteredSource.findIndex((item) =>
          matchPattern(item, value)
        );
        setHighlightedItem(
          firstMatchingItem !== undefined
            ? filteredSource[firstMatchingItem]
            : undefined
        );
      }

      // onChange?.(event);
    };

    const adornment = (
      <Button variant={"secondary"}>
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Button>
    );

    return (
      <>
        <Input
          variant={variant}
          endAdornment={adornment}
          disabled={disabled}
          value={selectedItem}
          aria-controls={listId}
          role="combobox"
          onChange={onInputChange}
          onBlur={blurHandler}
          readOnly={readOnly}
          aria-activedescendant={disabled ? undefined : activeDescendant}
          inputProps={{
            "aria-expanded": open,
            tabIndex: disabled ? -1 : 0,
            onFocus: focusHandler,
            onKeyDown: keyDownHandler,
          }}
          {...getTriggerProps()}
          {...InputProps}
          inputRef={inputRef as Ref<HTMLInputElement>}
        />
        {open && (
          <FloatingPortal>
            {/* The provider is needed to support the use case where an app has nested modes. The element that is portalled needs to have the same style as the current scope */}
            <SaltProvider>
              <div ref={floating} {...getPortalProps()}>
                <ListNext
                  className={clsx(withBaseName("list"), ListProps?.className)}
                  selected={selectedItem}
                  highlightedItem={highlightedItem}
                  disableFocus
                  onMouseDown={(event) =>
                    setSelectedItem(event.target.dataset.value)
                  }
                  onMouseOver={mouseOverHandler}
                  {...ListProps}
                  ref={listRef}
                >
                  {filteredSource.map((value: string, index) => {
                    const key = index;
                    return itemRenderer(key, value, selectedItem);
                  })}
                </ListNext>
              </div>
            </SaltProvider>
          </FloatingPortal>
        )}
      </>
    );
  }
);
