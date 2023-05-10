import React, {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEventHandler,
} from "react";
import { makePrefixer, Button } from "@salt-ds/core";
import { ChevronRightIcon, ChevronDownIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import "./NavItem.css";

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

function ExpansionButton({
  expanded,
  ...rest
}: { expanded?: boolean } & ComponentPropsWithoutRef<"button">) {
  return (
    <Button variant="secondary" {...rest}>
      {expanded ? (
        <ChevronDownIcon aria-hidden="true" />
      ) : (
        <ChevronRightIcon aria-hidden="true" />
      )}
    </Button>
  );
}

export const NavItem = forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem(props, ref) {
    const {
      active,
      children,
      className,
      expanded,
      orientation = "horizontal",
      parent,
      level,
      onExpand,
      href,
      style: styleProp,
      ...rest
    } = props;

    const style = {
      ...styleProp,
      "--saltNavItem-level": `${level}`,
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
        <a
          className={withBaseName("label")}
          aria-current={active ? "page" : undefined}
          href={href}
        >
          <span>{children}</span>
        </a>
        {parent && (
          <ExpansionButton
            className={withBaseName("expandButton")}
            expanded={expanded}
            onClick={onExpand}
          />
        )}
      </div>
    );
  }
);
