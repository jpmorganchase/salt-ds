import React, { createContext } from "react";

import { OrientationShape, TooltipComponentProps } from "../ToolbarProps";

export type ToolbarMeta = {
  orientation?: OrientationShape;
  disabled?: boolean;
  TooltipComponent?: React.FC<TooltipComponentProps>;
  setClickCallback: (id: string, callback: Function) => void;
  unsetClickCallback: (id: string) => void;
};

const undefinedSetCallback = () => {
  // eslint-disable-next-line no-console
  console.error("setClickCallback has not been set in ToolbarMetaContext");
};

const undefinedUnsetCallback = () => {
  // eslint-disable-next-line no-console
  console.error("unsetClickCallback has not been set in ToolbarMetaContext");
};

export default createContext<ToolbarMeta>({
  setClickCallback: undefinedSetCallback,
  unsetClickCallback: undefinedUnsetCallback,
});
