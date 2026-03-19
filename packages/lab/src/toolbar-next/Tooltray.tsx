import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tooltrayCss from "./Tooltray.css";

export interface TooltrayNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "align"> {
  /**
   * `TooltrayNext` is layout-only by default.
   * Pass `role="group"` with `aria-label` or `aria-labelledby` when the tray
   * represents a meaningful subgroup inside the toolbar.
   *
   * Alignment of the tooltray.
   * - When a `TooltrayNext` is used directly inside `ToolbarNext`, this acts as
   *   shorthand for which toolbar band the tray belongs to.
   * - When a `TooltrayNext` is used inside `ToolbarRegion`, this alignment is
   *   local to that region.
   *
   * Defaults to `"start"`.
   */
  align?: "start" | "end" | "center";
}

const withBaseName = makePrefixer("saltTooltrayNext");

export const TooltrayNext = forwardRef<HTMLDivElement, TooltrayNextProps>(
  function TooltrayNext(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      align = "start",
      children,
      className,
      role,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tooltray-next",
      css: tooltrayCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), className)}
        data-align={align}
        ref={ref}
        role={role}
        {...(role != null
          ? {
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
            }
          : {})}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
