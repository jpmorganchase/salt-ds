import { forwardRef, type HTMLAttributes } from "react";

export interface TreeProps extends HTMLAttributes<HTMLDivElement> {}

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  { children = "Tree placeholder", ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref}>
      {children}
    </div>
  );
});
