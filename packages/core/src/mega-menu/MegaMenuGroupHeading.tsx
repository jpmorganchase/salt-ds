import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer, useId, useIsomorphicLayoutEffect } from "../utils";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";
import megaMenuGroupHeadingCss from "./MegaMenuGroupHeading.css";

const withBaseName = makePrefixer("saltMegaMenuGroupHeading");

export interface MegaMenuGroupHeadingProps
  extends ComponentPropsWithoutRef<"h2"> {
  /**
   * The content of the mega menu group heading.
   */
  children?: ReactNode;
  /**
   * The heading element to render.
   * @default "h3"
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const MegaMenuGroupHeading = forwardRef<
  HTMLHeadingElement,
  MegaMenuGroupHeadingProps
>(function MegaMenuGroupHeading(
  { children, className, id: idProp, as: Heading = "h3", ...rest },
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
    <Heading
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
      id={id}
    >
      {children}
    </Heading>
  );
});
