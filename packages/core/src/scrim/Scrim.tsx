import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

import scrimCss from "./Scrim.css";

const withBaseName = makePrefixer("saltScrim");

export interface ScrimProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true` the scrim is bound to the document viewport.
   * The default value of this prop is false, and the default behavior is for Scrim to be bound to its parent container (nearest positioned ancestor).
   */
  fixed?: boolean;
  /**
   * If `true` the scrim is shown.
   */
  open?: boolean;
}

export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(function Scrim(
  { className, children, fixed = false, open = true, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-scrim",
    css: scrimCss,
    window: targetWindow,
  });

  if (!open) {
    return null;
  }

  return (
    <div
      className={clsx(
        withBaseName(),
        {
          [withBaseName("fixed")]: fixed,
        },
        className,
      )}
      data-testid="scrim"
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
});
