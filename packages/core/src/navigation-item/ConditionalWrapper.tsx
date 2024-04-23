import { MouseEvent, ReactNode } from "react";
import { NavigationItemProps } from "./NavigationItem";

interface ConditionalWrapperProps
  extends Pick<
    NavigationItemProps,
    | "parent"
    | "expanded"
    | "onExpand"
    | "active"
    | "href"
    | "onClick"
    | "linkProps"
  > {
  children: ReactNode;
  className: string;
}

export const ConditionalWrapper = ({
  children,
  className,
  parent,
  expanded,
  onExpand,
  active,
  href,
  linkProps,
}: ConditionalWrapperProps) => {
  const handleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onExpand?.(event);
  };

  return parent || (href === undefined && linkProps === undefined) ? (
    <button
      aria-label="expand"
      aria-expanded={expanded}
      className={className}
      onClick={handleExpand}
    >
      {children}
    </button>
  ) : (
    <a
      aria-current={active ? "page" : undefined}
      href={href}
      className={className}
      {...linkProps}
    >
      {children}
    </a>
  );
};
