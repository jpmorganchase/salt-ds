import { UseFloatingUIProps } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import { ComponentType, HTMLAttributes, ReactNode } from "react";
import { ItemToStringFunction } from "../list";
import { CascadingMenuListProps } from "./CascadingMenuList";

export interface ScreenBounds {
  clientHeight: number;
  clientWidth: number;
}

export interface MenuDescriptor {
  id?: string;
  menuItems?: MenuDescriptor[];
  title?: string;
  divider?: boolean;
  disabled?: boolean;
  tooltip?: string;
  icon?: ComponentType<IconProps>;
}

export interface CascadingMenuProps extends HTMLAttributes<HTMLElement> {
  /**
   * Cascading Menu reference element.
   * Needs to be able to hold a ref. If you are passing a custom component remember to spread the props
   * over your component.
   * If you want pass a ref instead and have control over opening/closing the cascading cascading menu,
   * please see {menuTriggerRef}
   */
  children?: ReactNode;
  /**
   * The document the Cascading Menu will use to listen for click away events.
   * Useful when rendering the Cascading Menu in other windows.
   */
  containingDocument?: Document;
  /**
   * Delay in ms before opening and closing a submenu on mouse hover or mouse out
   */
  delay?: number;
  /**
   * By default Cascading Menu will close when clicking outside the menus.
   * Use this prop to disable this feature.
   */
  disableClickAway?: boolean;
  /**
   * By default Cascading Menu closes a submenu when mouse out of the parent menu.
   * Use this prop to disable this feature.
   */
  disableMouseOutInteractions?: boolean;
  /**
   * Used by Cascading Menu to get the clientWidth and clientHeight of the virtual viewport.
   * Useful when rendering the Cascading Menu in other windows.
   */
  getScreenBounds?: () => ScreenBounds;
  /**
   * Height in pixels of the menu
   */
  height?: number;
  /**
   * The menu placement with regard to its trigger component.
   */
  rootPlacement?: UseFloatingUIProps["placement"];
  /**
   * The x and y offset coordinates of the root menu. Conforms to Popper spec in format `${x},${y}`
   */
  rootPlacementOffset?: string;
  /**
   * Uncontrolled property for specifying the initial source of cascading menu items.
   * Ids have to be unique within the cascading menu
   */
  initialSource?: MenuDescriptor;
  /**
   * Used to determine the string value for the selected item.
   */
  itemToString?: ItemToStringFunction;
  /**
   * Maximum menu width  (text longer than the max width will end with ellipsis)
   * set to "null" to allow the content to take as much space as needed with no truncating. Defaults to 544
   */
  maxWidth?: CascadingMenuListProps["maxWidth"];
  /**
   * Cascading Menu reference element used to position the cascading menu.
   * Use with the open controlled prop if not passing the menu trigger as children.
   * This has to be a native DOM element node,
   */
  menuTriggerRef?: HTMLElement;
  /**
   * Minimum menu width, if the content is smaller than the minWidth the menu width will be the same as minWidth
   * otherwise it will increase to the smallest width between content size and maxWidth. Defaults to 200
   */
  minWidth?: CascadingMenuListProps["minWidth"];
  /**
   * Callback that fires when a menu closes.
   */
  onClose?: () => void;
  /**
   * Callback that fires a menu item is clicked.
   * @param {MenuDescriptor} source item clicked
   * @param {MouseEvent | KeyboardEvent} click event
   */
  onItemClick?: (
    sourceItem: MenuDescriptor,
    event: MouseEvent | KeyboardEvent
  ) => void;
  /**
   * Callback that fires when menu opens.
   */
  onOpen?: () => void;
  /**
   * Controlled prop to open/close the cascading menu
   */
  open?: boolean;
  /**
   * Height of a row in the list
   */
  rowHeight?: number;
  /**
   * Controlled property for specifying the source of cascading menu items.
   * Ids have to be unique within the cascading menu
   */
  source?: MenuDescriptor;
  /**
   * The number of milliseconds to wait before showing the tooltip. Defaults to 1500 ms
   */
  tooltipEnterDelay?: number;
  /**
   * The number of milliseconds to wait before hiding the tooltip. Defaults to 0 ms
   */
  tooltipLeaveDelay?: number;
}
