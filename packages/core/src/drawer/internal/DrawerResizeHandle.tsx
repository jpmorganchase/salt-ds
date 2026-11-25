import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../../utils";
import type { DrawerProps } from "../Drawer";
import drawerResizeHandleCss from "./DrawerResizeHandle.css";

const withBaseName = makePrefixer("saltDrawerResizeHandle");

export interface DrawerResizeHandleProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The position of the Drawer, which places the handle on the Drawer's
   * opposite edge, for example the right edge of a `"left"` drawer, and sets
   * the direction of its grip dots.
   */
  position: NonNullable<DrawerProps["position"]>;
  /**
   * If `true`, the handle has its active styling, which takes precedence over
   * `hovered`. The Drawer sets it while it's resized by dragging or by placing
   * its edge by click.
   */
  resizing?: boolean;
  /**
   * If `true`, the handle has its hover styling. The Drawer sets it while a
   * mouse or pen pointer is over the handle and the Drawer isn't being
   * resized.
   */
  hovered?: boolean;
}

export const DrawerResizeHandle = forwardRef<
  HTMLDivElement,
  DrawerResizeHandleProps
>(function DrawerResizeHandle(props, ref) {
  const { position, resizing, hovered, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-drawer-resize-handle",
    css: drawerResizeHandleCss,
    window: targetWindow,
  });

  return (
    <div
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName(position),
        {
          [withBaseName("resizing")]: resizing,
          [withBaseName("hovered")]: hovered,
        },
        className,
      )}
      {...rest}
    />
  );
});
