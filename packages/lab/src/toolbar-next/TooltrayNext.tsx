import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tooltrayCss from "./TooltrayNext.css";

export type TooltrayNextOverflowMode = "none" | "independent" | "grouped";

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
   * - When a `TooltrayNext` is used inside `ToolbarContentNext`, this alignment is
   *   local to that content area.
   *
   * Defaults to `"start"`.
   */
  align?: "start" | "end" | "center";
  /**
   * Controls how this tray participates in `ToolbarNext` overflow.
   *
   * Defaults to `"independent"`.
   */
  overflowMode?: TooltrayNextOverflowMode;
  /**
   * Higher numbers overflow before lower numbers.
   *
   * Defaults to `0`.
   */
  overflowPriority?: number;
  /**
   * Collapse this tray into the shared overflow or a named local overflow.
   *
   * Defaults to `"shared"`.
   */
  overflowGroup?: "shared" | string;
  /**
   * Accessible label for the named overflow trigger.
   */
  overflowLabel?: string;
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
      overflowGroup = "shared",
      overflowLabel,
      overflowMode = "independent",
      overflowPriority = 0,
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
        {...rest}
        data-align={align}
        data-overflow-group={overflowGroup}
        data-overflow-label={overflowLabel}
        data-overflow-mode={overflowMode}
        data-overflow-priority={overflowPriority}
        ref={ref}
        role={role}
        {...(role != null
          ? {
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
            }
          : {})}
      >
        {children}
      </div>
    );
  },
);
