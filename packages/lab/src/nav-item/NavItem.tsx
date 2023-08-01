import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEventHandler,
  MouseEvent,
  ComponentType,
  ReactNode,
} from "react";
import { makePrefixer, Link } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
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
  /**
   * Whether the nav item has active children.
   */
  selected?: boolean;
  /**
   * Whether the nav item is expanded.
   */
  expanded?: boolean;
  /**
   * Level of nesting.
   */
  level?: number;
  /**
   * The orientation of the nav item.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the nav item is a parent with nested children.
   */
  parent?: boolean;
  /**
   * Action to be triggered when the nav item is expanded.
   */
  onExpand?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Href to be passed to the Link element.
   */
  href?: string;
  /**
   * Icon component to be displayed next to the nav item label.
   */
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * Badge component to be displayed next to the nav item label.
   */
  BadgeComponent?: ReactNode;
}

const withBaseName = makePrefixer("saltNavItem");

export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem(props, ref) {
    const {
      active,
      selected,
      children,
      className,
      expanded = false,
      orientation = "horizontal",
      parent,
      level = 0,
      onExpand,
      href,
      IconComponent,
      BadgeComponent,
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
            [withBaseName("selected")]: selected,
            [withBaseName("nested")]: level !== 0,
          },
          withBaseName(orientation),
          className
        )}
        ref={ref}
        style={style}
        {...rest}
      >
        {IconComponent && (
          <IconComponent aria-hidden className={withBaseName("icon")} />
        )}
        <Link
          className={withBaseName("label")}
          aria-current={active ? "page" : undefined}
          href={href}
        >
          <span>{children}</span>
        </Link>
        {BadgeComponent && BadgeComponent}
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
