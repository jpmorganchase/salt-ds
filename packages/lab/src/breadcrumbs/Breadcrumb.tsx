import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import classnames from "classnames";
import { makePrefixer, IconProps } from "@brandname/core";
import { Div, Span } from "@brandname/lab";
import { TooltipProps } from "../tooltip";
import { Link } from "../link";
import { useBreadcrumbsContext } from "./internal/BreadcrumbsContext";
import "./Breadcrumb.css";

const withBaseName = makePrefixer("uitkBreadcrumb");

export interface BreadcrumbProps {
  children?: ReactNode;
  ContainerProps?: HTMLAttributes<HTMLLIElement>;
  tooltipText?: string;
  tooltipProps?: TooltipProps;
  className?: string;
  href?: string;
  isCurrentLevel?: boolean;
  maxWidth?: number;
  minWidth?: number;
  onItemClick?: (item: any, event: any) => void; // TODO
  overflowLabel?: string;
  Icon?: React.ComponentType<IconProps>;
}

export const Breadcrumb = forwardRef<HTMLLIElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      children,
      ContainerProps = {},
      tooltipText,
      tooltipProps,
      isCurrentLevel,
      onItemClick,
      overflowLabel,
      maxWidth,
      Icon,
      minWidth,
      className,
      ...props
    },
    ref
  ) {
    const { itemsMaxWidth, itemsMinWidth, liClass } = useBreadcrumbsContext();

    const hasChildren = React.Children.count(children) !== 0;
    const hasOnlyIcon = Icon && !hasChildren;

    const getDefaultBreadcrumb = () =>
      isCurrentLevel ? (
        <Div
          aria-current="page"
          tooltipProps={tooltipProps}
          className={withBaseName("currentLevel")}
        >
          {children}
        </Div>
      ) : (
        <Link
          {...props}
          className={classnames(
            withBaseName(),
            className,
            {
              [withBaseName("justifyContentCenter")]: hasOnlyIcon,
            },
            withBaseName("regular")
          )}
        >
          {Icon && <Icon className={withBaseName("icon")} />}
          {hasChildren && (
            <Span className={withBaseName("text")}>{children}</Span>
          )}
        </Link>
      );

    const content = getDefaultBreadcrumb();

    const { style: styleProp } = ContainerProps;
    return (
      <li
        style={{
          ...styleProp,
          minWidth: minWidth != null ? minWidth : itemsMinWidth,
          maxWidth: maxWidth != null ? maxWidth : itemsMaxWidth,
        }}
        {...ContainerProps}
        className={classnames(liClass, ContainerProps.className)}
        ref={ref}
      >
        {content}
      </li>
    );
  }
);
