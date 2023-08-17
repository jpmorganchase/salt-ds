import { MouseEvent, ReactNode } from "react";
import { Link, Button } from "@salt-ds/core";
import { NavigationItemProps } from "./NavigationItem";

interface ConditionalWrapperProps
  extends Pick<
    NavigationItemProps,
    "parent" | "expanded" | "onExpand" | "active" | "href"
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
}: ConditionalWrapperProps) => {
  const handleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onExpand?.(event);
  };

  return parent ? (
    <Button
      aria-label="expand"
      variant="secondary"
      aria-expanded={expanded}
      className={className}
      onClick={handleExpand}
    >
      {children}
    </Button>
  ) : (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      className={className}
    >
      {children}
    </Link>
  );
};
