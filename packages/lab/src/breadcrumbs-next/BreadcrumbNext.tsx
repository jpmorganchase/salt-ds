import { type LinkProps, makePrefixer } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  forwardRef,
  type ReactNode,
} from "react";
import breadcrumbNextCss from "./BreadcrumbNext.css";
import { BreadcrumbNextLabel } from "./BreadcrumbNextLabel";
import { BreadcrumbNextTrigger } from "./BreadcrumbNextTrigger";
import {
  BreadcrumbNextContext,
  useBreadcrumbNextContext,
} from "./internal/BreadcrumbNextContext";

const withBaseName = makePrefixer("saltBreadcrumbNext");

export interface BreadcrumbNextProps
  extends Omit<ComponentPropsWithoutRef<"li">, "children"> {
  /**
   * Custom breadcrumb content. Use this for advanced composition with
   * `BreadcrumbNextTrigger` and `BreadcrumbNextLabel`.
   */
  children?: ReactNode;
  /**
   * If `true`, the breadcrumb represents the current page.
   */
  current?: boolean;
  /**
   * Optional icon displayed before the label in the default trigger.
   */
  icon?: ComponentType<IconProps>;
  /**
   * Breadcrumb label. Used as the canonical item label for generated content
   * and collapsed menu items.
   */
  label?: ReactNode;
  /**
   * The URL for a navigable breadcrumb.
   */
  href?: string;
  /**
   * Render prop to customize the navigable breadcrumb element.
   */
  render?: LinkProps["render"];
}

export const BreadcrumbNext = forwardRef<HTMLLIElement, BreadcrumbNextProps>(
  function BreadcrumbNext(props, ref) {
    const {
      children,
      className,
      current: currentProp,
      href,
      icon: Icon,
      label,
      render,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-breadcrumb-next",
      css: breadcrumbNextCss,
      window: targetWindow,
    });

    const parentContext = useBreadcrumbNextContext();
    const current = parentContext?.current ?? Boolean(currentProp);
    const showSeparator = parentContext?.showSeparator ?? false;
    const triggerRef = parentContext?.triggerRef;
    const primitiveChildren = isPrimitiveLabel(children) ? children : undefined;
    const defaultLabel = label ?? primitiveChildren;
    const content =
      children === undefined || primitiveChildren !== undefined ? (
        <BreadcrumbNextTrigger>
          {Icon ? (
            <span className={withBaseName("icon")}>
              <Icon aria-hidden />
            </span>
          ) : null}
          <BreadcrumbNextLabel>{defaultLabel}</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      ) : (
        children
      );
    const context = {
      current,
      href,
      label: defaultLabel,
      render,
      showSeparator,
      triggerRef,
    };

    return (
      <li ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        <BreadcrumbNextContext.Provider value={context}>
          {content}
          {showSeparator ? (
            <ChevronRightIcon
              aria-hidden
              className={withBaseName("separator")}
            />
          ) : null}
        </BreadcrumbNextContext.Provider>
      </li>
    );
  },
);

function isPrimitiveLabel(children: ReactNode) {
  return typeof children === "string" || typeof children === "number";
}
