import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";
import megaMenuGroupCss from "./MegaMenuGroup.css";
import { MegaMenuGroupContext } from "./MegaMenuGroupContext";
import { MegaMenuHeader } from "./MegaMenuHeader";

const withBaseName = makePrefixer("saltMegaMenuGroup");

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

    // Split the header from the items so the header sits outside the list; the
    // header reads its id from context rather than being cloned to inject one.
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === MegaMenuHeader && !header) {
        header = child;
      } else {
        items.push(child);
      }
    });

    return (
      <MegaMenuGroupContext.Provider value={{ headerId }}>
        <div
          className={clsx(withBaseName(), className)}
          data-mega-menu-column=""
          ref={ref}
          {...rest}
        >
          {header}
          <ul
            className={withBaseName("list")}
            aria-labelledby={header ? headerId : undefined}
          >
            {items}
          </ul>
        </div>
      </MegaMenuGroupContext.Provider>
    );
  },
);
