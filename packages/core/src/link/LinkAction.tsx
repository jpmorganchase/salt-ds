import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { renderProps } from "../utils";

interface LinkActionProps extends ComponentPropsWithoutRef<"a"> {}

export const LinkAction = forwardRef<HTMLAnchorElement, LinkActionProps>(
  function LinkAction(props, ref) {
    return renderProps("a", { ...props, ref });
  },
);
