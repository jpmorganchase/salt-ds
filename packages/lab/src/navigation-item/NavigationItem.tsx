import { ComponentPropsWithoutRef, forwardRef, MouseEventHandler } from "react";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { ExpansionIcon } from "./ExpansionIcon";
import { ConditionalWrapper } from "./ConditionalWrapper";

import navigationItemCss from "./NavigationItem.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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

    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
        style={style}
        {...rest}
      >
        <ConditionalWrapper
          className={clsx(
            withBaseName("wrapper"),
            {
              [withBaseName("active")]: active || blurActive,
              [withBaseName("blurActive")]: blurActive && level !== 0,
              [withBaseName("rootItem")]: level === 0,
            },
            withBaseName(orientation)
          )}
          parent={parent}
          expanded={expanded}
          onExpand={onExpand}
          active={active}
          href={href}
        >
          <span className={withBaseName("label")}>{children}</span>
          {parent && (
            <ExpansionIcon expanded={expanded} orientation={orientation} />
          )}
        </ConditionalWrapper>
      </div>
    );
  }
);
