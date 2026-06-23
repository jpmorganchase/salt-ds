import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import breadcrumbNextCss from "./BreadcrumbNext.css";

const withBaseName = makePrefixer("saltBreadcrumbNext");

export interface BreadcrumbNextProps extends ComponentPropsWithoutRef<"li"> {}

export const BreadcrumbNext = forwardRef<HTMLLIElement, BreadcrumbNextProps>(
  function BreadcrumbNext({ className, children, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-breadcrumb-next",
      css: breadcrumbNextCss,
      window: targetWindow,
    });

    return (
      <li ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {children ?? "I am BreadcrumbNext"}
      </li>
    );
  },
);
