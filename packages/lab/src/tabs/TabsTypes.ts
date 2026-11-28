import type {
  AriaAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";

import type { EditableLabelProps } from "../editable-label";
import type { OverflowSource, orientationType } from "../responsive";
import type { ExitEditModeHandler } from "./useEditableItem";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export interface FocusAPI {
  focus: () => void;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export interface TabDescriptor extends OverflowSource {
  element?: ReactElement;
}
/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type TabsSource = string[] | TabDescriptor[];

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type navigationProps = Pick<TabProps, "onFocus" | "onKeyDown">;

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type composableTabProps = navigationProps &
  Pick<
    TabProps,
    "onClick" | "onEnterEditMode" | "onExitEditMode" | "onMouseDown"
  >;

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type TabstripVariant = "primary" | "tertiary";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export interface TabstripProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * when true Tabs may be re-arranged by dragging individual Tabs to new position within Tabstrip.
   */
  allowDragDrop?: boolean;
  /**
   * Boolean that indicates if tabs are centered on the container
   */
  centered?: boolean;
  defaultSource?: TabsSource;
  /**
   *  index value of Selected Tab, used in uncontrolled mode
   */
  defaultActiveTabIndex?: number;

  editing?: boolean;
  /**
   * Boolean that enables add new tab
   */

  enableAddTab?: boolean;
  /**
   * @deprecated
   * Boolean that enables closing tabs
   */
  enableCloseTab?: boolean;
  /**
   * Boolean that enables renaming a tab
   */
  enableRenameTab?: boolean;
  keyBoardActivation?: "manual" | "automatic";
  onAddTab?: () => void;
  onActiveChange?: (tabIndex: number) => void;
  onCloseTab?: (tabIndex: number) => void;
  onMoveTab?: (fromIndex: number, toIndex: number) => void;
  orientation?: orientationType;
  onEnterEditMode?: () => void;
  onExitEditMode?: ExitEditModeHandler;
  /**
   * Boolean that indicates whether to enable overflow dropdown or not
   */
  overflowMenu?: boolean;
  promptForNewTabName?: boolean;
  showActivationIndicator?: boolean;
  source?: TabsSource;
  /**
   *  index value of Active Tab, used in controlled mode. Set to `null` for no active tab.
   */
  activeTabIndex?: number | null;
  /**
   * Set variant - defaults 'primary'
   */
  variant?: TabstripVariant;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type exitEditHandler = (
  originalValue: string,
  editedValue: string,
  allowDeactivation: boolean,
  tabIndex: number,
) => void;

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export interface responsiveDataAttributes {
  "data-index": number;
  "data-overflowed"?: boolean;
  "data-priority": number;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type TabProps = Omit<
  HTMLAttributes<HTMLElement>,
  "onClick" | "onKeyUp"
> & {
  ariaControls?: AriaAttributes["aria-controls"];
  closeable?: boolean;
  draggable?: boolean;
  dragging?: boolean;
  editable?: boolean;
  editing?: EditableLabelProps["editing"];
  focused?: boolean;
  // DO we need this as well as focussed ?
  focusVisible?: boolean;
  focusedChildIndex?: number;
  selected?: boolean;
  index?: number;
  label?: EditableLabelProps["defaultValue"];
  onClick?: (e: MouseEvent, index: number) => void;
  onClose?: (index: number) => void;
  onEnterEditMode?: () => void;
  onExitEditMode?: exitEditHandler;
  onKeyUp?: (e: KeyboardEvent, index: number) => void;
  orientation?: "horizontal" | "vertical";
  tabChildIndex?: number;
};

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export type TabElement = ReactElement<TabProps>;
