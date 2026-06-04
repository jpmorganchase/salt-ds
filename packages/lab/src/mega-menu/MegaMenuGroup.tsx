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
  type ReactNode,
} from "react";
import { MegaMenuColumn } from "./MegaMenuColumn";
import megaMenuGroupCss from "./MegaMenuGroup.css";
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

    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === MegaMenuHeader && !header) {
        header = cloneElement(child, { id: headerId });
      } else {
        items.push(child);
      }
    });

    return (
      <MegaMenuColumn
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      >
        {header}
        <ul
          className={withBaseName("list")}
          aria-labelledby={header ? headerId : undefined}
        >
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: children have no stable identity
            <li key={index} className={withBaseName("item")}>
              {item}
            </li>
          ))}
        </ul>
      </MegaMenuColumn>
    );
  },
);
