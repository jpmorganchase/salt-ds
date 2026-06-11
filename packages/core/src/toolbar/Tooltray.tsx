import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

import tooltrayCss from "./Tooltray.css";

export type TooltrayOverflowMode = "none" | "independent" | "grouped";

export interface TooltrayProps
  extends Omit<ComponentPropsWithoutRef<"div">, "align"> {
  /**
   * Alignment of the tooltray.
   * - When a `Tooltray` is used directly inside `Toolbar`, this acts as
   *   shorthand for which toolbar band the tray belongs to.
   * - When a `Tooltray` is used inside `ToolbarContent`, this alignment is
   *   local to that content area.
   *
   * Defaults to `"start"`.
   */
  align?: "start" | "end" | "center";
  /**
   * Controls how this tray participates in `Toolbar` overflow.
   *
   * Defaults to `"independent"`.
   */
  overflowMode?: TooltrayOverflowMode;
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

const withBaseName = makePrefixer("saltTooltray");

export const Tooltray = forwardRef<HTMLDivElement, TooltrayProps>(
  function Tooltray(
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
      testId: "salt-tooltray",
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
