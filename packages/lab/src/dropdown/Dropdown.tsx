import {
  makePrefixer,
  Portal,
  PortalProps,
  useFloatingUI,
  useForkRef,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { IconProps, ChevronDownIcon } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import {
  ComponentType,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
  useRef,
  useState,
} from "react";
import {
  ListBase,
  ListChangeHandler,
  ListMultiSelectionVariant,
  ListProps,
  ListSelectHandler,
  ListSelectionVariant,
  ListSingleSelectionVariant,
  ListStateContext,
} from "../list";
import { useId } from "../utils";
import { DropdownButton, DropdownButtonProps } from "./DropdownButton";
import { useDropdown } from "./useDropdown";

import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import { useDropdownSelectionAriaAttributes } from "./internal/useDropdownSelectionAriaAttributes";

import "./Dropdown.css";

export type DropdownControllerStateAndHelpers<
  Item = string,
  Variant extends ListSelectionVariant = "default"
> = {
  DropdownButtonProps: DropdownButtonProps;
  buttonRef?: Ref<HTMLDivElement>;
  isOpen?: boolean;
  itemToString?: (item: Item) => string;
  selectedItem?: Variant extends ListMultiSelectionVariant ? Array<Item> : Item;
};

export type DropdownChildrenFunction<
  Item = string,
  Variant extends ListSelectionVariant = "default"
> = (options: DropdownControllerStateAndHelpers<Item, Variant>) => ReactNode;

export interface DropdownProps<
  Item = string,
  Variant extends ListSelectionVariant = "default"
> extends Omit<
      HTMLAttributes<HTMLDivElement>,
      "children" | "onChange" | "onSelect"
    >,
    Pick<PortalProps, "disablePortal" | "container"> {
  /**
   * Props to be applied on the default button component
   */
  ButtonProps?: Partial<DropdownButtonProps>;
  /**
   * Replace the default Icon component
   */
  IconComponent?: ComponentType<any>;
  /**
   * Customize item component used for rendering in the dropdown list
   */
  ListItem?: ReactNode;
  /**
   * Props to be applied on the list component
   */
  ListProps?: Partial<ListProps<Item, Variant>>;
  /**
   * Object that houses ADA-related props.
   *
   * @property {bool} virtualized Set to `true` to boost browser performance
   * for long lists by rendering only the items currently scrolled into view
   * (plus overscan items). JSX: `adaExceptions={{virtualized:true}}`
   * For better ADA support, omit (or set to `false`).
   */
  adaExceptions?: {
    virtualized?: boolean;
  };
  /**
   * If the dropdown has no border
   */
  borderless?: boolean;
  /**
   * A ref to the button
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttonRef?: Ref<any>;
  /**
   * Override the triggering component
   */
  children?: DropdownChildrenFunction<Item, Variant>;
  /**
   * Disable user interaction
   */
  disabled?: boolean;
  /**
   * The number of items displayed in the visible area.
   *
   * Note that this determines the max height of the list if the list height is not set to 100%.
   *
   * @default 10
   */
  displayedItemCount?: number;
  /**
   * If, `true`, the Dropdown will occupy the full width of it's container
   */
  fullWidth?: boolean;
  /**
   * Sets the size of the down arrow icon. If this is not specified, a default size based on density is used.
   */
  iconSize?: IconProps["size"];
  /**
   * This is the initial isOpen value
   *
   * @default false
   */
  initialIsOpen?: boolean;
  /**
   * Pass an item that should be selected by default.
   */
  initialSelectedItem?: ListProps<Item, Variant>["selectedItem"];
  /**
   * Whether the menu should be considered open or closed.
   */
  isOpen?: boolean;
  /**
   * Used to determine the string value for the selected item.
   */
  itemToString?: (item: Item) => string;
  /**
   * Customize width of the Dropdown List. This supersedes `width`.
   */
  listWidth?: number | string;
  /**
   * Callback fired by the child component's onBlur.
   */
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Callback fired by the button / child component's onClick.
   */
  onButtonClick?: MouseEventHandler<HTMLDivElement>;
  /**
   * Called when the user selects an item and the selected item has changed.
   */
  onChange?: ListChangeHandler<Item, Variant>;
  /**
   * Callback fired by the child component's onFocus.
   */
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Called when the user selects an item no matter whether the selected item has changed.
   */
  onSelect?: ListSelectHandler<Item>;
  /**
   * The currently selected item.
   */
  selectedItem?: ListProps<Item, Variant>["selectedItem"];
  /**
   * List of items when using a Dropdown.
   */
  source: ReadonlyArray<Item>;
  /**
   Customize width of Dropdown. Also controls Dropdown List if `listWidth` prop is not set.
   */
  width?: number | string;
}

const withBaseName = makePrefixer("uitkDropdown");

/**
 * Renders a basic dropdown with selectable item
 */
export const Dropdown = forwardRef(function Dropdown<
  Item,
  Variant extends ListSingleSelectionVariant
>(
  {
    IconComponent = ChevronDownIcon,
    className,
    width = 180,
    children,
    container,
    disablePortal,
    ...restProps
  }: DropdownProps<Item, Variant>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    rootProps,
    buttonProps: { ref: buttonRef, ...buttonProps },
    listContext,
    listProps,
  } = useDropdown<Item, Variant>({ IconComponent, width, ...restProps });

  const listRef = useRef<HTMLElement>(null);

  const {
    disabled,
    fullWidth,
    isOpen,
    ref: rootRef,
    ...restRootProps
  } = rootProps;

  const [maxListHeight, setMaxListHeight] = useState<number | undefined>(
    undefined
  );
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware: [
      flip({
        fallbackPlacements: ["bottom-start", "top-start"],
      }),
      shift({ limiter: limitShift() }),
      size({
        apply({ availableHeight }) {
          setMaxListHeight(availableHeight);
        },
      }),
    ],
  });

  const handlePopperListAdapterRef = useForkRef<HTMLDivElement>(reference, ref);
  const handleRootRef = useForkRef(rootRef, handlePopperListAdapterRef);

  const ariaAttributes = useDropdownSelectionAriaAttributes(
    listContext.state.selectedItem,
    listProps.source
  );
  // Will need to figure out a better way to assign popper id's for the electron windows
  const id = useId();
  const Window = useWindow();

  return (
    <div
      className={classnames(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("fullwidth")]: fullWidth,
        },
        className
      )}
      ref={handleRootRef}
      {...restRootProps}
    >
      {children ? (
        children({
          DropdownButtonProps: buttonProps,
          buttonRef,
          isOpen,
          itemToString: listProps.itemToString,
          selectedItem: listContext.state.selectedItem,
        })
      ) : (
        <DropdownButton
          labelAriaAttributes={ariaAttributes}
          {...buttonProps}
          ref={buttonRef}
        />
      )}
      {rootRef.current && isOpen && (
        <Portal disablePortal={disablePortal} container={container}>
          <Window
            id={id}
            style={{
              top: y ?? "",
              left: x ?? "",
              position: strategy,
              maxHeight: maxListHeight ?? "",
            }}
            ref={floating}
          >
            <ListStateContext.Provider value={listContext}>
              <ListBase<Item>
                data-testid="dropdown-list"
                {...listProps}
                maxHeight={maxListHeight || listProps.maxHeight}
                listRef={listRef}
              />
            </ListStateContext.Provider>
          </Window>
        </Portal>
      )}
    </div>
  );
}) as <Item = string, Variant extends ListSingleSelectionVariant = "default">(
  props: DropdownProps<Item, Variant> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<DropdownProps<Item, Variant>>;
