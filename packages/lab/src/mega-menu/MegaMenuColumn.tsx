import { type ComponentPropsWithoutRef, forwardRef } from "react";

export const MegaMenuColumn = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(
  function MegaMenuColumn(props, ref) {
    return <div data-mega-menu-column="" ref={ref} {...props} />;
  },
);
