import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { capitalize, makePrefixer } from "../../utils";
import drawerResizeHandleCss from "./DrawerResizeHandle.css";
import type { DrawerResizePosition } from "./useDrawerResize";

const withBaseName = makePrefixer("saltDrawerResizeHandle");

/** Sides of the resize handle that can carry a border. */
export type DrawerResizeHandleBorder = "top" | "bottom" | "left" | "right";

export interface DrawerResizeHandleProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Edge the drawer is anchored to. The handle sits on the opposite edge. */
  position: DrawerResizePosition;
  /** Whether a drag is in progress. */
  resizing?: boolean;
  /** Sides of the handle to render a border on. */
  borders?: DrawerResizeHandleBorder[];
}

export const DrawerResizeHandle = forwardRef<
  HTMLDivElement,
  DrawerResizeHandleProps
>(function DrawerResizeHandle(props, ref) {
  const { position, resizing, borders, className, ...rest } = props;

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
        borders?.map((side) => withBaseName(`border${capitalize(side)}`)),
        className,
      )}
      data-resizing={resizing || undefined}
      {...rest}
    />
  );
});
