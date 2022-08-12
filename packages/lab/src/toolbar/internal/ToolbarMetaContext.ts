import { TooltipProps } from "@jpmorganchase/uitk-core";
import React, { createContext } from "react";
import { OrientationShape } from "../ToolbarProps";

export type ToolbarMeta = {
  orientation?: OrientationShape;
  disabled?: boolean;
  TooltipComponent?: React.FC<Partial<TooltipProps>>;
  setClickCallback: (id: string, callback: Function) => void;
  unsetClickCallback: (id: string) => void;
};

const undefinedSetCallback = () => {
  console.error("setClickCallback has not been set in ToolbarMetaContext");
};

const undefinedUnsetCallback = () => {
  console.error("unsetClickCallback has not been set in ToolbarMetaContext");
};

export default createContext<ToolbarMeta>({
  setClickCallback: undefinedSetCallback,
  unsetClickCallback: undefinedUnsetCallback,
});
