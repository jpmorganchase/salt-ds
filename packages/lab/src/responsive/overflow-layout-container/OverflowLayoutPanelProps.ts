import {
  HTMLAttributes,
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  MutableRefObject,
} from "react";

export type MenuState = {
  highlightedItemIndex: number | null;
  flipped: boolean;
};

// Until we adopt react types v 17
export type ForwardedRef<T> =
  | ((instance: T | null) => void)
  | MutableRefObject<T | null>
  | null;

interface ScreenBounds {
  clientHeight: number;
  clientWidth: number;
}

export interface MenuItem {
  menuItems?: MenuItem[];
  title?: string;
  divider?: boolean;
  disabled?: boolean;
  tooltip?: string;
  icon?: string;
}
export interface OverflowLayoutPanelProps extends HTMLAttributes<HTMLElement> {
  /**
   * Trigger element.
   * Needs to be able to hold a ref. If you are passing a custom component remember to spread the props
   * over your component.
   * If you want pass a ref instead and have control over opening/closing the cascading cascading menu,
   * please see {menuTriggerRef}
   */
  children: any;
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
   * Used by Cascading Menu to get the position of a parent menu relative to the virtual viewport.
   * Useful when rendering the Cascading Menu in other windows.
   */
  getBoundingClientRect?: (node: Node) => ClientRect;
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
   * Maximum menu width  (text longer than the max width will end with ellipsis)
   * set to "null" to allow the content to take as much space as needed with no truncating. Defaults to 544
   */
  maxWidth?: number | null;
  /**
   * Cascading Menu reference element used to position the cascading menu.
   * Use with the open controlled prop if not passing the menu trigger as children.
   * This has to be a native DOM element node,
   */
  menuTriggerRef?: ReactNode;
  /**
   * Minimum menu width, if the content is smaller than the minWidth the menu width will be the same as minWidth
   * otherwise it will increase to the smallest width between content size and maxWidth. Defaults to 200
   */
  minWidth?: number;
  /**
   * Callback that fires when a menu closes.
   */
  onClose?: () => void;
  /**
   * Callback that fires a menu item is clicked.
   * @param {MenuItem} source item clicked
   * @param {MouseEvent | KeyboardEvent} click event
   */
  onItemClick?: (
    sourceItem: MenuItem,
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
   * The menu placement with regard to its trigger component.
   */
  rootPlacement?: string;
  /**
   * The x and y offset coordinates of the root menu. Conforms to Popper spec in format `${x},${y}`
   */
  rootPlacementOffset?: string;
  /**
   * Height of a row in the list
   */
  rowHeight?: number;
  /**
   * The number of milliseconds to wait before showing the tooltip. Defaults to 1500 ms
   */
  tooltipEnterDelay?: number;
  /**
   * The number of milliseconds to wait before hiding the tooltip. Defaults to 0 ms
   */
  tooltipLeaveDelay?: number;
}
