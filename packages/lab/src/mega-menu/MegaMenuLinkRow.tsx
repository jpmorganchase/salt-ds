import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

const withBaseName = makePrefixer("saltMegaMenuLinkRow");

export interface MegaMenuLinkRowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the link row, typically anchor or link elements.
   */
  children?: ReactNode;
}

export const MegaMenuLinkRow = forwardRef<HTMLDivElement, MegaMenuLinkRowProps>(
  function MegaMenuLinkRow({ children, className, ...rest }, ref) {
    return (
      <div
        className={clsx(withBaseName(), className)}
        data-salt-mega-menu-region="true"
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
