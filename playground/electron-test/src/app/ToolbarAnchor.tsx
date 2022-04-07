import { IconProps } from "@brandname/core";
import { RefAttributes } from "react";
import { MoveAllIcon } from "@brandname/icons";

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
