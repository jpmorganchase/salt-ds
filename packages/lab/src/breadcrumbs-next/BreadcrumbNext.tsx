import { makePrefixer, type RenderPropsType, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
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
const withBreadcrumbsBaseName = makePrefixer("saltBreadcrumbsNext");

function isPrimitiveBreadcrumbLabel(children: ReactNode) {
  return (
    (typeof children === "string" && children.trim() !== "") ||
    typeof children === "number"
  );
}

function isMissingBreadcrumbContent(children: ReactNode) {
  const childArray = Children.toArray(children);

  return (
    childArray.length === 0 ||
    childArray.every(
      (child) => typeof child === "string" && child.trim() === "",
    )
  );
}

let missingBreadcrumbContentWarningShown = false;

function warnIfMissingBreadcrumbContent() {
  if (
    process.env.NODE_ENV === "production" ||
    missingBreadcrumbContentWarningShown
  ) {
    return;
  }

  missingBreadcrumbContentWarningShown = true;
  console.warn(
    "BreadcrumbNext requires children to render a named breadcrumb item. Use text children for simple items or BreadcrumbNextTrigger with BreadcrumbNextLabel for composed items.",
  );
}

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
   * The URL for a navigable breadcrumb.
   */
  href?: string;
  /**
   * Render prop to enable customization of the underlying link element.
   */
  render?: RenderPropsType["render"];
}

export const BreadcrumbNext = forwardRef<HTMLLIElement, BreadcrumbNextProps>(
  function BreadcrumbNext(props, ref) {
    const {
      children,
      className,
      current: currentProp,
      href,
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
    const onNavigate = parentContext?.onNavigate;
    const placement = parentContext?.placement ?? "trail";
    const showSeparator = parentContext?.showSeparator ?? false;
    const triggerRef = parentContext?.triggerRef;
    const resolvedRender = render ?? parentContext?.render;
    const { LevelSeparatorIcon } = useIcon();
    const missingContent = isMissingBreadcrumbContent(children);

    if (missingContent) {
      warnIfMissingBreadcrumbContent();
    }

    const primitiveChildren = isPrimitiveBreadcrumbLabel(children)
      ? children
      : undefined;
    const content = missingContent ? null : primitiveChildren !== undefined ? (
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>{primitiveChildren}</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    ) : (
      children
    );
    const context = {
      current,
      href,
      onNavigate,
      placement,
      render: resolvedRender,
      showSeparator,
      triggerRef,
    };

    return (
      <li
        ref={ref}
        className={clsx(
          placement === "disclosure"
            ? withBreadcrumbsBaseName("disclosureListItem")
            : withBaseName(),
          className,
        )}
        {...rest}
      >
        <BreadcrumbNextContext.Provider value={context}>
          {content}
          {placement === "trail" && showSeparator ? (
            <LevelSeparatorIcon
              aria-hidden
              className={withBaseName("separator")}
            />
          ) : null}
        </BreadcrumbNextContext.Provider>
      </li>
    );
  },
);
