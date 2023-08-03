import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEventHandler,
  MouseEvent,
  ComponentType,
  ReactNode,
} from "react";
import { makePrefixer, Link, Button } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import { ExpansionIcon } from "./ExpansionIcon";

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
  blurSelected?: boolean;
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

type ConditionalWrapper = {
  children: ReactNode;
  className: string;
};

export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem(props, ref) {
    const {
      active,
      blurSelected,
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

    const ConditionalWrapper = ({
      children,
      className,
      ...rest
    }: ConditionalWrapper) =>
      parent ? (
        <Button
          aria-label="expand"
          variant="secondary"
          aria-expanded={expanded}
          className={clsx(withBaseName("expandButton"), className)}
          onClick={handleExpand}
          {...rest}
        >
          {children}
        </Button>
      ) : (
        <Link
          aria-current={active ? "page" : undefined}
          href={href}
          className={className}
          {...rest}
        >
          {children}
        </Link>
      );

    return (
      <div
        ref={ref}
        style={style}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <ConditionalWrapper
          className={clsx(
            withBaseName("wrapper"),
            {
              [withBaseName("active")]: active,
              [withBaseName("blurSelected")]: blurSelected,
              [withBaseName("nested")]: level !== 0,
            },
            withBaseName(orientation)
          )}
        >
          {IconComponent && (
            <IconComponent aria-hidden className={withBaseName("icon")} />
          )}
          <span className={withBaseName("label")}>{children}</span>
          {BadgeComponent}
          {parent && (
            <ExpansionIcon
              expanded={expanded}
              orientation={orientation}
              className={withBaseName("expandIcon")}
            />
          )}
        </ConditionalWrapper>
      </div>
    );
  }
);
