import { Link, makePrefixer, Text, type TooltipProps } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentType,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { CascadingMenuProps } from "../cascading-menu/CascadingMenuProps";
import breadcrumbCss from "./Breadcrumb.css";
import { useBreadcrumbsContext } from "./internal/BreadcrumbsContext";

const withBaseName = makePrefixer("saltBreadcrumb");

export interface BreadcrumbProps
  extends Pick<CascadingMenuProps, "onItemClick"> {
  children?: ReactNode;
  ContainerProps?: HTMLAttributes<HTMLLIElement>;
  tooltipText?: string;
  tooltipProps?: TooltipProps;
  className?: string;
  href?: string;
  isCurrentLevel?: boolean;
  maxWidth?: number;
  minWidth?: number;
  overflowLabel?: string;
  Icon?: ComponentType<IconProps>;
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
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-breadcrumb",
      css: breadcrumbCss,
      window: targetWindow,
    });

    const { itemsMaxWidth, itemsMinWidth, liClass } = useBreadcrumbsContext();

    const hasChildren = Children.count(children) !== 0;
    const hasOnlyIcon = Icon && !hasChildren;

    const getDefaultBreadcrumb = () =>
      isCurrentLevel ? (
        <Text
          maxRows={1}
          className={clsx(
            withBaseName(),
            className,
            withBaseName("currentLevel"),
          )}
          styleAs="label"
        >
          {children}
        </Text>
      ) : (
        <div
          className={clsx(
            withBaseName(),
            className,
            {
              [withBaseName("justifyContentCenter")]: hasOnlyIcon,
            },
            withBaseName("regular"),
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
        className={clsx(liClass, containerClassName)}
        {...containerPropsRest}
      >
        {content}
      </li>
    );
  },
);
