import {
  AriaAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";

import { orientationType, OverflowSource } from "../responsive";
import { EditableLabelProps } from "../editable-label";
import { ExitEditModeHandler } from "./useEditableItem";

export interface FocusAPI {
  focus: () => void;
}

export interface TabDescriptor extends OverflowSource {
  element?: JSX.Element;
}
export type TabsSource = string[] | TabDescriptor[];

export type navigationProps = Pick<TabProps, "onFocus" | "onKeyDown">;

export type composableTabProps = navigationProps &
  Pick<
    TabProps,
    "onClick" | "onEnterEditMode" | "onExitEditMode" | "onMouseDown"
  >;

export type TabstripEmphasis = "low";

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
   * Set visual emphasis - supported value 'low'
   */
  emphasis?: TabstripEmphasis;
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
   *  index value of Active Tab, used in controlled mode
   */
  activeTabIndex?: number;
}

export type exitEditHandler = (
  originalValue: string,
  editedValue: string,
  allowDeactivation: boolean,
  tabIndex: number
) => void;

export interface responsiveDataAttributes {
  "data-index": number;
  "data-overflowed"?: boolean;
  "data-priority": number;
}

export type TabProps = Omit<
  HTMLAttributes<HTMLElement>,
  "onClick" | "onKeyUp" | "onMouseDown" /*| "children" */
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
  onMouseDown?: (e: MouseEvent<HTMLElement>, index: number) => void;
  orientation?: "horizontal" | "vertical";
  tabChildIndex?: number;
};

export type TabElement = ReactElement<TabProps>;

// type TabWithLabel = BaseTabProps & {
//   label: EditableLabelProps["defaultValue"];
//   children?: ReactNode;
// };
// type TabWithChildren = BaseTabProps & {
//   children: ReactNode;
//   label?: EditableLabelProps["defaultValue"];
// };

// export type TabProps = TabWithChildren | TabWithLabel;
