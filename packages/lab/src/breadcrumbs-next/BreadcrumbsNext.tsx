import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import breadcrumbsNextCss from "./BreadcrumbsNext.css";

const withBaseName = makePrefixer("saltBreadcrumbsNext");

export interface BreadcrumbsNextProps extends ComponentPropsWithoutRef<"nav"> {}

export const BreadcrumbsNext = forwardRef<HTMLElement, BreadcrumbsNextProps>(
  function BreadcrumbsNext({ className, children, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-breadcrumbs-next",
      css: breadcrumbsNextCss,
      window: targetWindow,
    });

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <ol className={withBaseName("ol")}>{children}</ol>
      </nav>
    );
  },
);
