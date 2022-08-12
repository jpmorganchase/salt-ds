import {
  AriaAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";

import { orientationType } from "../responsive";
import { EditableLabelProps } from "../editable-label";
import { dragStrategy } from "./drag-drop";

export type TabDescriptor = {
  label: string;
  editable?: boolean;
  closeable?: boolean;
};
export type TabsSource = string[] | TabDescriptor[];

export type composableTabProps = Pick<
  TabProps,
  | "onBlur"
  | "onFocus"
  | "onKeyDown"
  | "onClick"
  | "onEnterEditMode"
  | "onExitEditMode"
  | "onMouseDown"
>;

export interface TabstripProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  allowDragDrop?: boolean | dragStrategy;
  centered?: boolean;
  defaultTabs?: TabsSource;
  defaultValue?: number;
  enableAddTab?: boolean;
  enableCloseTab?: boolean;
  enableRenameTab?: boolean;
  keyBoardActivation?: "manual" | "automatic";
  onAddTab?: () => void;
  onChange?: (tabIndex: number) => void;
  onCloseTab?: (tabIndex: number) => void;
  noBorder?: boolean;
  onMoveTab?: (fromIndex: number, toIndex: number) => void;
  orientation?: orientationType;
  overflowMenu?: boolean;
  promptForNewTabName?: boolean;
  showActivationIndicator?: boolean;
  tabs?: TabsSource;
  value?: number;
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
  "onClick" | "onKeyDown" | "onKeyUp" | "onMouseDown" /*| "children" */
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
  onKeyDown?: (e: KeyboardEvent, index: number, childIndex?: number) => void;
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
