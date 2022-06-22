import { useControlled, useForkRef } from "@jpmorganchase/uitk-core";
import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  Ref,
  SyntheticEvent,
  useMemo,
  useRef,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import {
  itemToString as defaultItemToString,
  ListSelectionVariant,
  useList,
  useTypeSelect,
} from "../list";
import { useId } from "../utils";
import { DropdownProps } from "./Dropdown";
import { DropdownButtonProps } from "./DropdownButton";
import { useResizeObserver } from "./internal/useResizeObserver";

export function useDropdown<Item, Variant extends ListSelectionVariant>(
  props: DropdownProps<Item, Variant> = { source: [] },
  isMultiSelect = false
) {
  const {
    inFormField,
    onFocus: formFieldOnFocus,
    onBlur: formFieldOnBlur,
    a11yProps: { "aria-labelledby": ariaLabelledBy, ...restA11yProps } = {},
  } = useFormFieldProps();

  const {
    ButtonProps = {},
    IconComponent,
    ListItem,
    ListProps,
    adaExceptions: { virtualized } = {},
    "aria-label": ariaLabelProp,
    "aria-labelledby": ariaLabelledByProp,
    borderless = false,
    buttonRef: buttonRefProp,
    children,
    disabled,
    displayedItemCount,
    fullWidth: fullWidthProp, // = formFieldFullWidth,
    iconSize,
    id: idProp,
    initialIsOpen = false,
    initialSelectedItem,
    isOpen: isOpenProp,
    itemToString = defaultItemToString,
    listWidth: listWidthProp,
    onBlur: onBlurProp,
    onButtonClick: onButtonClickProp,
    onChange: onChangeProp,
    onFocus: onFocusProp,
    onMouseLeave,
    onMouseOver,
    onSelect,
    selectedItem: selectedItemProp,
    source,
    width: widthProp,
    ...rest
  } = props;

  const id = useId(idProp);
  const buttonRef = useRef(null);

  const isFullWidth = fullWidthProp !== undefined ? fullWidthProp : inFormField;

  const { ref: rootRef, width: observedWidth } = useResizeObserver({
    fullWidth: isFullWidth,
  });

  const {
    onKeyDown: onButtonKeyDown,
    onKeyDownCapture: onButtonKeyDownCapture,
    ...restButtonProps
  } = ButtonProps;

  const [isOpen, setIsOpen] = useControlled({
    controlled: isOpenProp,
    default: initialIsOpen,
    name: "useDropdown",
    state: "isOpen",
  });

  const listWidth = useMemo(() => {
    if (isFullWidth) {
      return observedWidth ? observedWidth : undefined;
    } else {
      return listWidthProp ? listWidthProp : widthProp;
    }
  }, [isFullWidth, listWidthProp, observedWidth, widthProp]);

  const { focusedRef, state, helpers, listProps } = useList<Item, Variant>({
    ListItem,
    displayedItemCount,
    id: `${id}-list`,
    initialSelectedItem,
    itemToString,
    onChange: onChangeProp,
    onSelect,
    selectedItem: selectedItemProp,
    selectionVariant: (isMultiSelect ? "multiple" : "default") as Variant,
    source,
    tabToSelect: !isMultiSelect,
    virtualized,
    width: listWidth,
    disableFocus: true,
    disableMouseDown: true,
    ...ListProps,
  });

  const { selectedItem, highlightedIndex } = state;

  const { setHighlightedIndex, setFocusVisible } = helpers;

  const {
    onBlur: onListBlur,
    onClick: onListClick,
    onFocus: onListFocus,
    onKeyDown: onListKeyDown,
    id: listId,
    "aria-activedescendant": ariaActivedescendant,
    "aria-multiselectable": ariaMultiselectable,
    getItemAtIndex,
    getItemIndex,
    itemCount,
    ...restListProps
  } = listProps;

  const { onKeyDownCapture: onTypeSelectKeyDownCapture } = useTypeSelect({
    getItemAtIndex,
    highlightedIndex,
    itemCount,
    itemToString,
    setFocusVisible,
    setHighlightedIndex,
  });

  const getSelectedItemLabel = () => {
    if (isMultiSelect && Array.isArray(selectedItem)) {
      if (selectedItem.length === 0) {
        return undefined;
      } else if (selectedItem.length === 1) {
        return itemToString(selectedItem[0]);
      } else {
        return `${selectedItem.length} items selected`;
      }
    } else {
      return selectedItem == null
        ? undefined
        : itemToString(selectedItem as Item);
    }
  };

  const syncListFocus = (event: any) => {
    if (!isOpen) {
      onListFocus?.(event);
    } else {
      onListBlur?.(event);
    }
  };

  const handleButtonClick = (event: SyntheticEvent) => {
    // Do not trigger menu open for 'Enter' and 'SPACE' key as they're handled in `handleButtonKeyDown`
    if (
      ["Enter", " "].indexOf((event as KeyboardEvent<HTMLDivElement>).key) ===
      -1
    ) {
      setIsOpen((value?: boolean) => !value);
      syncListFocus(event);
    }

    onButtonClickProp?.(event as MouseEvent<HTMLDivElement>);
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ("Escape" === event.key) {
      event.preventDefault();
      if (isOpen) {
        setIsOpen(false);
        onListBlur?.(event as any);
      }
    } else if ("ArrowDown" === event.key) {
      event.preventDefault();
      if (event.altKey) {
        event.stopPropagation();
      }
      if (!isOpen) {
        setIsOpen(true);
        onListFocus?.(event as any);
      }
    } else if ("Tab" === event.key) {
      if (isOpen) {
        setIsOpen(false);
        onListBlur?.(event as any);
      }
    } else if (["Enter", " "].indexOf(event.key) !== -1) {
      event.preventDefault();
      if (!isMultiSelect || !isOpen) {
        setIsOpen((value?: boolean) => !value);
        syncListFocus(event);
      }
    }

    // A lot of keyDown events are shared in the List already
    onListKeyDown?.(event);

    onButtonKeyDown?.(event);
  };

  const handleButtonKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    onTypeSelectKeyDownCapture?.(event);

    onButtonKeyDownCapture?.(event);
  };

  const handleListClick = (event: MouseEvent<HTMLDivElement>) => {
    if (onListClick) {
      onListClick(event);
    }

    if (!isMultiSelect) {
      setIsOpen(false);
    }
  };

  const handleButtonBlur = (event: FocusEvent<HTMLDivElement>) => {
    // Next line causes an issue for DesktopWindows. Need to consider how we fix.
    setIsOpen(false);
    onListBlur?.(event);
    onBlurProp?.(event);
    formFieldOnBlur?.(event);
  };

  const handleButtonFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (isOpen) {
      onListFocus?.(event);
    }

    onFocusProp?.(event);

    formFieldOnFocus?.(event);
  };

  const dropdownButtonLabelId = `${listId as string}--label`;

  const getAriaActiveDescendant = () => {
    if (isOpen && ariaActivedescendant) {
      return ariaActivedescendant;
    }
    return isMultiSelect ? undefined : dropdownButtonLabelId;
  };

  const dropdownButtonProps: DropdownButtonProps & {
    ref: Ref<HTMLDivElement>;
  } = {
    IconComponent,
    "aria-activedescendant": getAriaActiveDescendant(),
    "aria-expanded": isOpen,
    "aria-multiselectable": ariaMultiselectable,
    "aria-owns": isOpen ? listId : undefined,
    "aria-label": ariaLabelProp,
    "aria-labelledby": isMultiSelect
      ? [dropdownButtonLabelId, ariaLabelledBy, ariaLabelledByProp]
          .filter((x) => !!x)
          .join(" ")
      : [ariaLabelledBy, ariaLabelledByProp].filter((x) => !!x).join(" "),
    ariaHideOptionRole: isOpen,
    // This will result in a duplicated 'listbox' on top of the list within the popper, but is an ADA requirement
    role: "listbox",
    disabled,
    fullWidth: isFullWidth,
    iconSize,
    id,
    isOpen,
    label: getSelectedItemLabel(),
    labelId: dropdownButtonLabelId,
    // `fullWidth` is handled separately in `DropdownButton`
    style: { width: isFullWidth ? undefined : widthProp },

    onBlur: handleButtonBlur,
    onClick: disabled ? undefined : handleButtonClick,
    onFocus: handleButtonFocus,
    onKeyDown: disabled ? undefined : handleButtonKeyDown,
    onKeyDownCapture: disabled ? undefined : handleButtonKeyDownCapture,
    onMouseLeave,
    onMouseOver,

    ...restButtonProps,
    ...restA11yProps,

    ref: useForkRef<HTMLDivElement>(
      buttonRef,
      useForkRef<HTMLDivElement>(focusedRef, buttonRefProp)
    ),
  };

  return {
    rootProps: {
      ...rest,
      "aria-expanded": undefined,
      "aria-haspopup": undefined,
      "aria-labelledby": undefined,
      "data-testid": "dropdown",
      disabled,
      isOpen,
      fullWidth: isFullWidth,
      role: undefined,
      ref: rootRef,
    },
    buttonProps: dropdownButtonProps,
    listContext: { state, helpers },
    listProps: {
      "aria-multiselectable": ariaMultiselectable,
      "aria-labelledby": ariaLabelledBy,
      id: listId,
      borderless,
      onBlur: onListBlur,
      onClick: handleListClick,
      onFocus: onListFocus,
      onKeyDown: onListKeyDown,
      getItemAtIndex,
      getItemIndex,
      itemCount,
      ...restListProps,
    },
  };
}
