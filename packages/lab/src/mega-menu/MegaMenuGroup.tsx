import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import megaMenuGroupCss from "./MegaMenuGroup.css";

const withBaseName = makePrefixer("saltMegaMenuGroup");

function isMegaMenuHeader(child: ReactElement): boolean {
  return !!(child.type as { __isMegaMenuHeader?: boolean })?.__isMegaMenuHeader;
}

export interface MegaMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu group, typically MegaMenuHeader and MegaMenuItem components.
   */
  children?: ReactNode;
}

export const MegaMenuGroup = forwardRef<HTMLDivElement, MegaMenuGroupProps>(
  function MegaMenuGroup({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-group",
      css: megaMenuGroupCss,
      window: targetWindow,
    });

    const headerId = useId();
    let header: ReactNode = null;
    const items: ReactNode[] = [];

    Children.forEach(children, (child) => {
      if (isValidElement(child) && isMegaMenuHeader(child) && !header) {
        header = cloneElement(child, { id: headerId });
      } else {
        items.push(child);
      }
    });

    return (
      <div
        className={clsx(withBaseName(), className)}
        data-mega-menu-column=""
        ref={ref}
        {...rest}
      >
        {header}
        <ol
          className={withBaseName("list")}
          aria-labelledby={header ? headerId : undefined}
        >
          {items}
        </ol>
      </div>
    );
  },
);
