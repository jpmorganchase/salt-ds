import { makePrefixer } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentType,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useMemo,
} from "react";
import type { BreadcrumbProps } from "./Breadcrumb";
import breadcrumbsCss from "./Breadcrumbs.css";
import { BreadcrumbsCollapsed } from "./internal/BreadcrumbsCollapsed";
import { BreadcrumbsContext } from "./internal/BreadcrumbsContext";
import { BreadcrumbsSeparator } from "./internal/BreadcrumbsSeparator";

const iconWidth = 12;

const withBaseName = makePrefixer("saltBreadcrumbs");

function insertSeparators(
  items: ReactNode[],
  className?: string,
  separator?: ReactNode,
  hideCurrentLevel?: boolean,
  shouldRenderAllItems?: boolean,
  itemsAfterCollapse?: number,
) {
  return items.reduce((acc: ReactNode[], current: ReactNode, index: number) => {
    if (index < items.length - 1) {
      return acc.concat(
        current,
        <li
          aria-hidden
          className={className}
          key={`separator-${
            // biome-ignore lint/suspicious/noArrayIndexKey: Using index as key is acceptable here
            index
          }`}
        >
          {separator}
        </li>,
      );
    }
    const skipLastElement =
      (hideCurrentLevel && shouldRenderAllItems) ||
      (hideCurrentLevel && !shouldRenderAllItems && itemsAfterCollapse !== 0);
    return skipLastElement ? acc : acc.concat(current);
  }, []);
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  Menu?: ComponentType;
  SeparatorProps?: IconProps;
  hideCurrentLevel?: boolean;
  itemsAfterCollapse?: number;
  itemsBeforeCollapse?: number;
  itemsMaxWidth?: number | string;
  itemsMinWidth?: number | string;
  maxItems?: number;
  separator?: ReactNode;
  wrap?: boolean;
  className?: string;
  children?: ReactNode;
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(props, ref) {
    const {
      children,
      className,
      itemsAfterCollapse = 1,
      itemsBeforeCollapse = 1,
      maxItems = 3,
      separator: separatorProp,
      hideCurrentLevel,
      itemsMinWidth: itemsMinWidthProp,
      itemsMaxWidth,
      wrap,
      Menu: _Menu,
      SeparatorProps = {},
      ...other
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-breadcrumbs",
      css: breadcrumbsCss,
      window: targetWindow,
    });

    const itemsMinWidth =
      itemsMinWidthProp != null ? itemsMinWidthProp : iconWidth;

    const breadcrumbsContext = useMemo(
      () => ({
        wrap,
        itemsMinWidth,
        itemsMaxWidth,
        liClass: withBaseName("li"),
      }),
      [wrap, itemsMaxWidth, itemsMinWidth],
    );

    const separator = separatorProp || (
      <BreadcrumbsSeparator {...SeparatorProps} />
    );

    const childrenArray = Children.toArray(children);
    const shouldRenderAllItems =
      wrap || maxItems == null || childrenArray.length <= maxItems;

    const allItems = childrenArray
      .filter(isValidElement)
      .map((child, index) => {
        const isLastChild = index === childrenArray.length - 1;

        return cloneElement(child, {
          isCurrentLevel: isLastChild,
        } as BreadcrumbProps);
      });

    const renderItemsBeforeAndAfter = () => {
      // This defends against someone passing weird input, to ensure that if all
      // items would be shown anyway, we just show all items without the EllipsisItem
      if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
        console.warn(
          [
            "You have provided an invalid combination of properties to the Breadcrumbs.",
            `itemsAfterCollapse={${itemsAfterCollapse}} +itemsBeforeCollapse={${itemsBeforeCollapse}} >= maxItems={${maxItems}}`,
          ].join("\n"),
        );
        return allItems;
      }

      const hiddenItems = allItems.slice(
        itemsBeforeCollapse,
        allItems.length - itemsAfterCollapse,
      );
      return [
        ...allItems.slice(0, itemsBeforeCollapse),
        <li className={withBaseName("li")} key="breadcrumbs-collapsed">
          <BreadcrumbsCollapsed
            accessibleText={`Breadcrumb levels ${itemsBeforeCollapse + 1} to ${
              allItems.length - itemsAfterCollapse
            }`}
            className={withBaseName("overflowButton")}
          >
            {hiddenItems}
          </BreadcrumbsCollapsed>
        </li>,
        ...allItems.slice(
          allItems.length - itemsAfterCollapse,
          allItems.length,
        ),
      ];
    };

    const itemsToRender = shouldRenderAllItems
      ? allItems
      : renderItemsBeforeAndAfter();
    return (
      <BreadcrumbsContext.Provider value={breadcrumbsContext}>
        <nav
          aria-label="Breadcrumb"
          className={clsx(withBaseName(), className)}
          data-testid="breadcrumbs"
          ref={ref}
          {...other}
        >
          <ol
            className={clsx(withBaseName("ol"), {
              [withBaseName("ol-wrap")]: wrap,
            })}
          >
            {insertSeparators(
              itemsToRender,
              withBaseName("separator"),
              separator,
              hideCurrentLevel,
              shouldRenderAllItems,
              itemsAfterCollapse,
            )}
          </ol>
        </nav>
      </BreadcrumbsContext.Provider>
    );
  },
);
