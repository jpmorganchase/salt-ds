import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

import tooltrayCss from "./Tooltray.css";

export interface TooltrayProps
  extends Omit<ComponentPropsWithoutRef<"div">, "align"> {
  /**
   * The alignment of the tray. Directly inside a `Toolbar`, it sets which band
   * of the toolbar the tray is in. Inside a `ToolbarContent`, it aligns the tray
   * within that content area.
   * @default "start"
   */
  align?: "start" | "end" | "center";
  /**
   * How the tray moves into an overflow when there isn't room for it. `"none"`
   * keeps it in the toolbar, `"independent"` moves it on its own, and
   * `"grouped"` moves it together with the other trays in the same named
   * `overflowGroup`.
   * @default "independent"
   */
  overflowMode?: "none" | "independent" | "grouped";
  /**
   * The overflow priority of the tray. Trays with higher numbers move into an
   * overflow before trays with lower numbers.
   * @default 0
   */
  overflowPriority?: number;
  /**
   * The overflow the tray moves into. `"shared"` is the toolbar's shared "More"
   * overflow. Any other value names a local overflow, which has its own trigger.
   * @default "shared"
   */
  overflowGroup?: "shared" | string;
  /**
   * The label of the named overflow's trigger, used in its accessible name. Only
   * applies when `overflowGroup` isn't `"shared"`. When not set, the value of
   * `overflowGroup` is used.
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
