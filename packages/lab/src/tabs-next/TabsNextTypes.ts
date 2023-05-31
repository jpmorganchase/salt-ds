import {
  AriaAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";
export interface FocusAPI {
  focus: () => void;
}

export type navigationProps = Pick<TabProps, "onFocus" | "onKeyDown">;

export type composableTabProps = navigationProps &
  Pick<TabProps, "onClick" | "onMouseDown">;

export interface TabstripProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Boolean that indicates if tabs are centered on the container
   */
  centered?: boolean;
  /**
   *  index value of Selected Tab, used in uncontrolled mode
   */
  defaultActiveTabIndex?: number;
  /**
   * @deprecated
   * Boolean that enables closing tabs
   */
  enableCloseTab?: boolean;
  onActiveChange?: (tabIndex: number) => void;
  onCloseTab?: (index: string) => void;
  /**
   *  index value of Active Tab, used in controlled mode
   */
  activeTabIndex?: number;
}
export type TabProps = HTMLAttributes<HTMLElement> & {
  ariaControls?: AriaAttributes["aria-controls"];
  closeable?: boolean;
  draggable?: boolean;
  dragging?: boolean;
  selected?: boolean;
  label?: string;
  id: string;
  onClose?: (id: string) => void;
  tabChildIndex?: number;
};

export type TabElement = ReactElement<TabProps>;
