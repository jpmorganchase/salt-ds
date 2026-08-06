import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, type RenderPropsType } from "../utils";
import breadcrumbCss from "./Breadcrumb.css";
import { BreadcrumbLabel } from "./BreadcrumbLabel";
import { BreadcrumbTrigger } from "./BreadcrumbTrigger";
import {
  BreadcrumbContext,
  useBreadcrumbContext,
} from "./internal/BreadcrumbContext";

const withBaseName = makePrefixer("saltBreadcrumb");
const withBreadcrumbsBaseName = makePrefixer("saltBreadcrumbs");

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
    "Breadcrumb requires children to render a named breadcrumb item. Use text children for simple items or BreadcrumbTrigger with BreadcrumbLabel for composed items.",
  );
}

export interface BreadcrumbProps
  extends Omit<ComponentPropsWithoutRef<"li">, "children"> {
  /**
   * Custom breadcrumb content. Use this for advanced composition with
   * `BreadcrumbTrigger` and `BreadcrumbLabel`.
   */
  children?: ReactNode;
  /**
   * If `true`, the breadcrumb represents the current page.
   */
  current?: boolean;
  /**
   * The URL for the breadcrumb. Provide this for the current breadcrumb so it
   * renders as a focusable link with `aria-current="page"`.
   */
  href?: string;
  /**
   * Render prop to enable customization of the underlying link element.
   */
  render?: RenderPropsType["render"];
}

export const Breadcrumb = forwardRef<HTMLLIElement, BreadcrumbProps>(
  function Breadcrumb(props, ref) {
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
      testId: "salt-breadcrumb",
      css: breadcrumbCss,
      window: targetWindow,
    });

    const parentContext = useBreadcrumbContext();
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
      <BreadcrumbTrigger>
        <BreadcrumbLabel>{primitiveChildren}</BreadcrumbLabel>
      </BreadcrumbTrigger>
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
        <BreadcrumbContext.Provider value={context}>
          {content}
          {placement === "trail" && showSeparator ? (
            <LevelSeparatorIcon
              aria-hidden
              className={withBaseName("separator")}
            />
          ) : null}
        </BreadcrumbContext.Provider>
      </li>
    );
  },
);
