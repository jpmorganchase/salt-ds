import { makePrefixer, TooltipProps } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { Text } from "../text";
import { Link } from "../link";
import { useBreadcrumbsContext } from "./internal/BreadcrumbsContext";
import "./Breadcrumb.css";

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
        <Text
          maxRows={1}
          className={classnames(
            withBaseName(),
            className,
            withBaseName("currentLevel")
          )}
          styleAs="label"
        >
          {children}
        </Text>
      ) : (
        <div
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
            <Link maxRows={1} styleAs="label" {...props}>
              {children}
            </Link>
          )}
        </div>
      );

    const content = getDefaultBreadcrumb();

    const {
      style: containerStyle,
      className: containerClassName,
      ...containerPropsRest
    } = ContainerProps;

    return (
      <li
        ref={ref}
        style={{
          ...containerStyle,
          minWidth: minWidth ?? itemsMinWidth,
          maxWidth: maxWidth ?? itemsMaxWidth,
        }}
        className={classnames(liClass, containerClassName)}
        {...containerPropsRest}
      >
        {content}
      </li>
    );
  }
);
