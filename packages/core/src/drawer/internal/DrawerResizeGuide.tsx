import { FloatingPortal } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { SaltProvider, SaltProviderNext, useTheme } from "../../salt-provider";
import { makePrefixer } from "../../utils";
import type { DrawerProps } from "../Drawer";
import drawerResizeGuideCss from "./DrawerResizeGuide.css";

const withBaseName = makePrefixer("saltDrawerResizeGuide");

export interface DrawerResizeGuideProps
  extends ComponentPropsWithoutRef<"div"> {
  position: NonNullable<DrawerProps["position"]>;
}

/** Covers the viewport while placing the edge by click, so the click doesn't reach the content. */
export const DrawerResizeGuide = forwardRef<
  HTMLDivElement,
  DrawerResizeGuideProps
>(function DrawerResizeGuide(props, ref) {
  const { position, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-drawer-resize-guide",
    css: drawerResizeGuideCss,
    window: targetWindow,
  });

  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  const vertical = position === "left" || position === "right";

  return (
    <FloatingPortal>
      <ChosenSaltProvider applyClassesTo="scope">
        <div
          ref={ref}
          aria-hidden
          className={clsx(
            withBaseName(),
            withBaseName(vertical ? "vertical" : "horizontal"),
            className,
          )}
          {...rest}
        />
      </ChosenSaltProvider>
    </FloatingPortal>
  );
});
