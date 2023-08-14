import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEventHandler,
  MouseEvent,
  ReactNode,
} from "react";
import { makePrefixer, Link, Button } from "@salt-ds/core";
import { clsx } from "clsx";
import { ExpansionIcon } from "./ExpansionIcon";

import navigationItemCss from "./NavigationItem.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export interface NavigationItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the navigation item is active.
   */
  active?: boolean;
  /**
   * Whether the parent navigation item has active nested items.
   */
  blurSelected?: boolean;
  /**
   * Whether the navigation item is expanded.
   */
  expanded?: boolean;
  /**
   * Level of nesting.
   */
  level?: number;
  /**
   * The orientation of the navigation item.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the navigation item is a parent with nested items.
   */
  parent?: boolean;
  /**
   * Action to be triggered when the navigation item is expanded.
   */
  onExpand?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Href to be passed to the Link element.
   */
  href?: string;
}

const withBaseName = makePrefixer("saltNavigationItem");

type ConditionalWrapper = {
  children: ReactNode;
  className: string;
};

export const NavigationItem = forwardRef<HTMLDivElement, NavigationItemProps>(
  function NavigationItem(props, ref) {
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
      style: styleProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-navigation-item",
      css: navigationItemCss,
      window: targetWindow,
    });

    const style = {
      ...styleProp,
      "--saltNavigationItem-level": `${level}`,
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
          <span className={withBaseName("label")}>{children}</span>
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
