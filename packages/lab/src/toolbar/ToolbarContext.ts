import React, { createContext, useContext } from "react";

import { OrientationShape } from "./ToolbarProps";

export type ToolbarContextProps = {
  orientation?: OrientationShape;
  disabled?: boolean;
  isCollapsed: (id: string) => boolean;
  isInOverflowPanel: (id: string) => boolean;
};

const undefinedCollapsedCallback = (id: string) => {
  // eslint-disable-next-line no-console
  console.error(`isCollapsed ${id},  has not been set in ToolbarContext`);
  return false;
};

const undefinedOverflowPanelCallback = (id: string) => {
  // eslint-disable-next-line no-console
  console.error(`isInOverflowPanel ${id}  has not been set in ToolbarContext`);
  return false;
};

export const ToolbarContext = createContext<ToolbarContextProps>({
  isCollapsed: undefinedCollapsedCallback,
  isInOverflowPanel: undefinedOverflowPanelCallback,
});

export const useToolbarContext = () => useContext(ToolbarContext);
