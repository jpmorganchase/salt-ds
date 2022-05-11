import { IconProps } from "@jpmorganchase/uitk-core";
import { RefAttributes } from "react";
import { MoveAllIcon } from "@jpmorganchase/uitk-icons";

export const ToolbarAnchor = (
  props: JSX.IntrinsicAttributes & IconProps & RefAttributes<HTMLSpanElement>
) => {
  return (
    <MoveAllIcon
      {...props}
      style={{
        // @ts-ignore
        "-webkit-app-region": "drag",
      }}
    />
  );
};
