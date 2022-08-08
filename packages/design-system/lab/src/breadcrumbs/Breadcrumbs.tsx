import { makePrefixer } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import React, {
  HTMLAttributes,
  isValidElement,
  ReactNode,
  useMemo,
} from "react";
import warning from "warning";
import { BreadcrumbProps } from "./Breadcrumb";
import { BreadcrumbsCollapsed } from "./internal/BreadcrumbsCollapsed";
import { BreadcrumbsContext } from "./internal/BreadcrumbsContext";
import { BreadcrumbsSeparator } from "./internal/BreadcrumbsSeparator";

import "./Breadcrumbs.css";

const iconWidth = 12;

const withBaseName = makePrefixer("uitkBreadcrumbs");

function insertSeparators(
  items: ReactNode[],
  className?: string,
  separator?: ReactNode,
  hideCurrentLevel?: boolean,
  shouldRenderAllItems?: boolean,
  itemsAfterCollapse?: number
) {
  return items.reduce((acc: ReactNode[], current: ReactNode, index: number) => {
    if (index < items.length - 1) {
      return acc.concat(
        current,
        <li aria-hidden className={className} key={`separator-${index}`}>
          {separator}
        </li>
      );
    } else {
      const skipLastElement =
        (hideCurrentLevel && shouldRenderAllItems) ||
        (hideCurrentLevel && !shouldRenderAllItems && itemsAfterCollapse !== 0);
      return skipLastElement ? acc : acc.concat(current);
    }
  }, []);
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  Menu?: any;
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

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
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
      Menu,
      SeparatorProps = {},
      ...other
    } = props;

    const itemsMinWidth =
      itemsMinWidthProp != null ? itemsMinWidthProp : iconWidth;

    const breadcrumbsContext = useMemo(
      () => ({
        wrap,
        itemsMinWidth,
        itemsMaxWidth,
        liClass: withBaseName("li"),
      }),
      [wrap, itemsMaxWidth, itemsMinWidth]
    );

    const separator = separatorProp || (
      <BreadcrumbsSeparator {...SeparatorProps} />
    );

    const childrenArray = React.Children.toArray(children);
    const shouldRenderAllItems =
      wrap || maxItems == null || childrenArray.length <= maxItems;

    const allItems = childrenArray
      .filter(isValidElement)
      .map((child, index) => {
        const isLastChild = index === childrenArray.length - 1;

        return React.cloneElement(child, {
          isCurrentLevel: isLastChild,
        } as BreadcrumbProps);
      });

    const renderItemsBeforeAndAfter = () => {
      // This defends against someone passing weird input, to ensure that if all
      // items would be shown anyway, we just show all items without the EllipsisItem
      if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
        warning(
          false,
          [
            "You have provided an invalid combination of properties to the Breadcrumbs.",
            `itemsAfterCollapse={${itemsAfterCollapse}} +itemsBeforeCollapse={${itemsBeforeCollapse}} >= maxItems={${maxItems}}`,
          ].join("\n")
        );
        return allItems;
      }

      const hiddenItems = allItems.slice(
        itemsBeforeCollapse,
        allItems.length - itemsAfterCollapse
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
          allItems.length
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
          className={classnames(withBaseName(), className)}
          data-testid="breadcrumbs"
          ref={ref}
          {...other}
        >
          <ol
            className={classnames(withBaseName("ol"), {
              [withBaseName("ol-wrap")]: wrap,
            })}
          >
            {insertSeparators(
              itemsToRender,
              withBaseName("separator"),
              separator,
              hideCurrentLevel,
              shouldRenderAllItems,
              itemsAfterCollapse
            )}
          </ol>
        </nav>
      </BreadcrumbsContext.Provider>
    );
  }
);
