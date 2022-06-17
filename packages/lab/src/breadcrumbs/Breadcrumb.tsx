import {
  makePrefixer,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { Link } from "../link";
import { useOverflowDetection } from "../utils";
import { useBreadcrumbsContext } from "./internal/BreadcrumbsContext";
import { DefaultCurrentBreadcrumb } from "./internal/DefaultCurrentBreadcrumb";

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

    const [contentRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();

    const tooltipTitle = tooltipText || overflowLabel || String(children);
    const hasChildren = React.Children.count(children) !== 0;
    const hasOnlyIcon = Icon && !hasChildren;

    const getDefaultBreadcrumb = () =>
      isCurrentLevel ? (
        <DefaultCurrentBreadcrumb
          aria-disabled={isOverflowed}
          className={withBaseName("currentLevel")}
          ref={contentRef}
          role={isOverflowed ? "link" : undefined}
          tabIndex={isOverflowed ? 0 : undefined}
        >
          {children}
        </DefaultCurrentBreadcrumb>
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
            <span className={withBaseName("text")} ref={contentRef}>
              {children}
            </span>
          )}
        </Link>
      );

    const content = getDefaultBreadcrumb();

    const { getTooltipProps, getTriggerProps } = useTooltip({
      enterDelay: 1500,
      placement: "top",
    });

    const {
      style: containerStyle,
      className: containerClassName,
      ...containerPropsRest
    } = ContainerProps;

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<"li">({
      style: {
        ...containerStyle,
        minWidth: minWidth != null ? minWidth : itemsMinWidth,
        maxWidth: maxWidth != null ? maxWidth : itemsMaxWidth,
      },
      className: classnames(liClass, containerClassName),
      ...containerPropsRest,
    });

    const handleRef = useForkRef(triggerRef, ref);

    return (
      <>
        <li {...triggerProps} ref={handleRef}>
          {content}
        </li>
        <Tooltip
          {...getTooltipProps({ title: tooltipTitle, ...tooltipProps })}
        />
      </>
    );
  }
);
