import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";
import { makePrefixer, mergeProps } from "../utils";
import { clsx } from "clsx";
import { ExpansionIcon } from "./ExpansionIcon";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import navigationItemCss from "./NavigationItem.css";

type OptionalPartial<T, K extends keyof T> = Partial<Pick<T, K>>;

type RenderProp<P = React.HTMLAttributes<any>> = (props: P) => ReactNode;

export interface NavigationItemRenderProps
  extends OptionalPartial<
    NavigationItemProps,
    "active" | "expanded" | "level" | "parent" | "orientation"
  > {
  /**
   * Props to apply to the chld row to render a link
   */
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  /**
   * Props to apply to the parent row to open and close the row
   */
  parentProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

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
   * Render prop to enable customisation of navigation item element.
   */
  render?: RenderProp<NavigationItemRenderProps> | ReactElement;
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

type CreateElementProps = NavigationItemRenderProps &
  OptionalPartial<NavigationItemProps, "render">;

function createElement(Type: React.ElementType, props: CreateElementProps) {
  const { render, ...rest } = props;
  const elementProps = props.parent ? props.parentProps : props.linkProps;
  let element: ReactElement;
  if (React.isValidElement<any>(render)) {
    const renderProps = render.props;
    element = React.cloneElement(
      render,
      mergeProps(elementProps as Record<string, unknown>, renderProps)
    );
  } else if (render) {
    element = render(rest) as ReactElement;
  } else {
    element = <Type {...elementProps} />;
  }
  return element;
}

export const NavigationItem = forwardRef<HTMLDivElement, NavigationItemProps>(
  function NavigationItem(props, ref) {
    const {
      active,
      blurActive,
      render,
      children,
      className,
      expanded = false,
      href,
      orientation = "horizontal",
      parent,
      level = 0,
      onExpand,
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

    const isParent = parent || href === undefined; // for backwards compatiblity with original
    const elementProps = {
      className: clsx(
        withBaseName("wrapper"),
        {
          [withBaseName("active")]: active || blurActive,
          [withBaseName("blurActive")]: blurActive,
          [withBaseName("rootItem")]: level === 0,
        },
        withBaseName(orientation)
      ),
      children: (
        <>
          <span className={withBaseName("label")}>{children}</span>
          {isParent ? (
            <ExpansionIcon expanded={expanded} orientation={orientation} />
          ) : null}
        </>
      ),
    };
    let parentProps: Partial<ButtonHTMLAttributes<HTMLButtonElement>> = {};
    let linkProps: Partial<AnchorHTMLAttributes<HTMLAnchorElement>> = {};
    if (isParent) {
      const handleExpand = onExpand
        ? (event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onExpand(event);
          }
        : undefined;
      parentProps = {
        ...elementProps,
        "aria-label": "expand",
        "aria-expanded": expanded,
        onClick: handleExpand,
      };
    } else {
      linkProps = {
        ...elementProps,
        href,
        "aria-label": "change page",
        "aria-current": active ? "page" : undefined,
      };
    }

    const defaultElementType = isParent ? "button" : "a";
    const renderedElement = createElement(defaultElementType, {
      active,
      expanded,
      parent: isParent,
      level,
      orientation,
      render,
      linkProps: !isParent ? linkProps : undefined,
      parentProps: isParent ? parentProps : undefined,
    });
    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
        style={style}
        {...rest}
      >
        {renderedElement}
      </div>
    );
  }
);
