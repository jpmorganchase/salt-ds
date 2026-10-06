import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { makePrefixer } from "../../utils";
import type { DrawerProps } from "../Drawer";
import drawerResizeHandleCss from "./DrawerResizeHandle.css";

const withBaseName = makePrefixer("saltDrawerResizeHandle");

export interface DrawerResizeHandleProps
  extends ComponentPropsWithoutRef<"div"> {
  position: NonNullable<DrawerProps["position"]>;
  resizing?: boolean;
  hovered?: boolean;
  guideOffset?: number | null;
}

export const DrawerResizeHandle = forwardRef<
  HTMLDivElement,
  DrawerResizeHandleProps
>(function DrawerResizeHandle(props, ref) {
  const { position, resizing, hovered, guideOffset, className, ...rest } =
    props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-drawer-resize-handle",
    css: drawerResizeHandleCss,
    window: targetWindow,
  });

  const horizontal = position === "left" || position === "right";

  return (
    <>
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
      {guideOffset != null &&
        targetWindow &&
        createPortal(
          <div
            aria-hidden
            className={clsx(
              withBaseName("guide"),
              withBaseName(horizontal ? "guideVertical" : "guideHorizontal"),
            )}
            style={horizontal ? { left: guideOffset } : { top: guideOffset }}
          />,
          targetWindow.document.body,
        )}
    </>
  );
});
