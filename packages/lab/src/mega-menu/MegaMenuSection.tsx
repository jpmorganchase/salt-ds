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
import { MegaMenuHeading } from "./MegaMenuHeading";
import megaMenuSectionCss from "./MegaMenuSection.css";

const withBaseName = makePrefixer("saltMegaMenuSection");

export interface MegaMenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu section, typically MegaMenuHeading and MegaMenuLink components.
   */
  children?: ReactNode;
}

export const MegaMenuSection = forwardRef<HTMLDivElement, MegaMenuSectionProps>(
  function MegaMenuSection({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-section",
      css: megaMenuSectionCss,
      window: targetWindow,
    });

    const headingId = useId();
    let heading: ReactNode = null;
    const items: ReactNode[] = [];

    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === MegaMenuHeading && !heading) {
        heading = cloneElement(child, { id: headingId });
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
        {heading}
        <ul
          className={withBaseName("list")}
          aria-labelledby={heading ? headingId : undefined}
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
