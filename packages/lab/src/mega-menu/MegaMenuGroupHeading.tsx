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
  extends ComponentPropsWithoutRef<"h2"> {
  /**
   * The content of the mega menu group heading.
   */
  children?: ReactNode;
  /**
   * Heading level — renders the matching `<h1>`–`<h6>` element.
   * @default 3
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const MegaMenuGroupHeading = forwardRef<
  HTMLHeadingElement,
  MegaMenuGroupHeadingProps
>(function MegaMenuGroupHeading(
  { children, className, id: idProp, level = 3, ...rest },
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

  const HeadingTag = `h${level}` as const;

  return (
    <HeadingTag
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
      id={id}
    >
      {children}
    </HeadingTag>
  );
});
