import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEventHandler,
  MouseEvent,
} from "react";
import { makePrefixer, Link } from "@salt-ds/core";
import { clsx } from "clsx";
import { ExpansionButton } from "./ExpansionButton";

import navItemCss from "./NavItem.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export interface NavItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the nav item is active.
   */
  active?: boolean;
  expanded?: boolean;
  level?: number;
  /**
   * The orientation of the nav item.
   */
  orientation?: "horizontal" | "vertical";
  parent?: boolean;
  onExpand?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
}

const withBaseName = makePrefixer("saltNavItem");

export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem(props, ref) {
    const {
      active,
      children,
      className,
      expanded = false,
      orientation = "horizontal",
      parent,
      level = 0,
      onExpand,
      href,
      style: styleProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-nav-item",
      css: navItemCss,
      window: targetWindow,
    });

    const style = {
      ...styleProp,
      "--saltNavItem-level": `${level}`,
    };

    const handleExpand = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onExpand?.(event);
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("active")]: active,
          },
          withBaseName(orientation),
          className
        )}
        ref={ref}
        style={style}
        {...rest}
      >
        <Link
          className={withBaseName("label")}
          aria-current={active ? "page" : undefined}
          href={href}
        >
          <span>{children}</span>
        </Link>
        {parent && (
          <ExpansionButton
            aria-expanded={expanded}
            className={withBaseName("expandButton")}
            expanded={expanded}
            onClick={handleExpand}
            orientation={orientation}
          />
        )}
      </div>
    );
  }
);
