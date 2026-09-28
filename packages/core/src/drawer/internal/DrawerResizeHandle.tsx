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
  /** Edge the drawer is anchored to. The handle sits on the opposite edge. */
  position: NonNullable<DrawerProps["position"]>;
  /** Whether a drag is in progress. */
  resizing?: boolean;
}

export const DrawerResizeHandle = forwardRef<
  HTMLDivElement,
  DrawerResizeHandleProps
>(function DrawerResizeHandle(props, ref) {
  const { position, resizing, className, ...rest } = props;

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
        { [withBaseName("resizing")]: resizing },
        className,
      )}
      {...rest}
    />
  );
});
