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
  position: NonNullable<DrawerProps["position"]>;
  resizing?: boolean;
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
