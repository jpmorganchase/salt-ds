import { IconProps } from "@brandname/core";
import { RefAttributes } from "react";
import { MoveAllIcon } from "@brandname/icons";

export const ToolbarAnchor = (
  props: JSX.IntrinsicAttributes & IconProps & RefAttributes<HTMLSpanElement>
) => {
  return (
    // @ts-ignore
    <MoveAllIcon
      {...props}
      style={{ "-webkit-app-region": "drag", cursor: "pointer" }}
    />
  );
};
