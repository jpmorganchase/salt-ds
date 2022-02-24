import React, { KeyboardEvent, HTMLAttributes } from "react";

export interface OverflowPanelItemProps
  extends Omit<HTMLAttributes<HTMLElement>, "onKeyDown"> {
  blurSelected?: boolean;
  closeMenu?: () => void;
  hasToolTip?: boolean;
  index: number;
  isInteracted?: boolean;
  isNavigatingWithKeyboard?: boolean;
  onItemClick?: Function;
  onKeyDown?: (evt: KeyboardEvent<HTMLElement>, closeOnClick: boolean) => void;
  sourceItem: React.ReactElement;
  tooltipEnterDelay?: number;
  tooltipLeaveDelay?: number;
}
