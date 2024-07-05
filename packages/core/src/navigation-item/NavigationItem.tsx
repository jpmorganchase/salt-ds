import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  MouseEventHandler,
} from "react";
import { makePrefixer } from "../utils";
import { clsx } from "clsx";
import { ExpansionIcon } from "./ExpansionIcon";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import navigationItemCss from "./NavigationItem.css";
import { NavigationItemAction } from "./NavigationItemAction";
import { RenderPropsType } from "../utils";

export interface NavigationItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the navigation item is active.
   */
  active?: boolean;
  /**
   * Whether the nested group is collapsed and there is an active nested item within it.
   */
  blurActive?: boolean;
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
   * Render prop to enable customisation of navigation item element.
   */
  render?: RenderPropsType["render"];
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

export const NavigationItem = forwardRef<HTMLDivElement, NavigationItemProps>(
  function NavigationItem(props, ref) {
    const {
      active,
      blurActive,
      render,
      children,
      className,
      expanded = false,
      href,
      orientation = "horizontal",
      parent,
      level = 0,
      onExpand,
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

    const isParent = parent || href === undefined;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onExpand?.(event);
    };

    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
        style={style}
        {...rest}
      >
        <NavigationItemAction
          className={clsx(
            withBaseName("wrapper"),
            {
              [withBaseName("active")]: active || blurActive,
              [withBaseName("blurActive")]: blurActive,
              [withBaseName("rootItem")]: level === 0,
            },
            withBaseName(orientation)
          )}
          render={render ?? (isParent ? <button /> : undefined)}
          aria-label={isParent ? "expand" : undefined}
          aria-expanded={isParent ? expanded : undefined}
          onClick={handleClick}
          aria-current={!isParent && active ? "page" : undefined}
          href={href}
        >
          <span className={withBaseName("label")}>{children}</span>
          {isParent ? (
            <ExpansionIcon expanded={expanded} orientation={orientation} />
          ) : null}
        </NavigationItemAction>
      </div>
    );
  }
);
