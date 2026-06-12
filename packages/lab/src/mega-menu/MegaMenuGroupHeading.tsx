import { makePrefixer, useId, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";
import megaMenuGroupHeadingCss from "./MegaMenuGroupHeading.css";

const withBaseName = makePrefixer("saltMegaMenuGroupHeading");

export interface MegaMenuGroupHeadingProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu group heading.
   */
  children?: ReactNode;
}

export const MegaMenuGroupHeading = forwardRef<
  HTMLDivElement,
  MegaMenuGroupHeadingProps
>(function MegaMenuGroupHeading(
  { children, className, id: idProp, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-group-heading",
    css: megaMenuGroupHeadingCss,
    window: targetWindow,
  });

  const id = useId(idProp);
  const { setHeadingId } = useMegaMenuGroup();
  useIsomorphicLayoutEffect(() => {
    setHeadingId(id);
    return () => setHeadingId(undefined);
  }, [id, setHeadingId]);

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
      id={id}
    >
      <div className={withBaseName("content")}>{children}</div>
    </div>
  );
});
