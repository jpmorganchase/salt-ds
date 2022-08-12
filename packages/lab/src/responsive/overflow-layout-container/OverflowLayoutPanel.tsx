/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, makePrefixer } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, { forwardRef, ReactElement } from "react";
import Tooltray from "../../toolbar/Tooltray";
import { OverflowLayoutPanelProps } from "./OverflowLayoutPanelProps";
import OverflowPanelItem from "./OverflowPanelItem";
import { OverflowPanelItemProps } from "./OverflowPaneltemProps";

import "./OverflowLayoutPanel.css";

const withBaseName = makePrefixer("uitkOverflowLayoutPanel");

export const OverflowLayoutPanel = forwardRef<
  HTMLDivElement,
  OverflowLayoutPanelProps
>(function OverflowPanel(props, forwardedRef) {
  const {
    children,
    className,
    onKeyDown,
    onItemClick,
    tooltipEnterDelay,
    tooltipLeaveDelay,
  } = props;

  const panelItems = React.Children.toArray(children) as ReactElement[];

  const getInstantItems = (items: any) =>
    items[1] && items[1].length ? items[1] : items[1].props.children;

  const renderTooltrayOverflow = (
    items: React.ReactNode,
    collapsible: string,
    padEnd: string,
    tooltrayIndex: number
  ) => {
    if (items === undefined) return null;
    const collapsedItems =
      collapsible === "instant" ? getInstantItems(items) : items;
    const trayItems = collapsedItems.length ? collapsedItems : [collapsedItems];
    const isButtonTray = trayItems.every((item: any) => item.type === Button);
    return (
      <div
        className={cx("tray", isButtonTray ? "buttontray" : "tooltray", {
          padEnd: !!padEnd,
        })}
        key={tooltrayIndex}
      >
        {trayItems.map((item: ReactElement, index: number) => {
          const panelItemProps: OverflowPanelItemProps = {
            // onItemClick,
            onKeyDown,
            tooltipEnterDelay,
            tooltipLeaveDelay,
            sourceItem: item,
            index,
          };
          return <OverflowPanelItem key={index} {...panelItemProps} />;
        })}
      </div>
    );
  };

  const menuItemsCount = panelItems.reduce((count, item) => {
    if (item.type === Tooltray) {
      // eslint-disable-next-line no-param-reassign
      count = count + item.props.children.length;
    } else {
      // eslint-disable-next-line no-param-reassign
      count++;
    }
    return count;
  }, 0);

  return (
    <div
      aria-label={`Overflow menu with ${menuItemsCount} items`}
      className={cx(withBaseName(), className)}
      id="overflowPanelContainer"
      ref={forwardedRef}
      role="group"
    >
      {panelItems.map((menuItem, index) => {
        // const hasToolTip = !!menuItem.tooltip;
        const panelItemProps = {
          onItemClick,
          onKeyDown,
          tooltipEnterDelay,
          tooltipLeaveDelay,
          sourceItem: menuItem,
          index,
        };
        switch (menuItem.type) {
          case Tooltray:
            return renderTooltrayOverflow(
              menuItem.props.children,
              menuItem.props["data-collapsible"],
              menuItem.props["data-pad-end"],
              index
            );
          default:
            return <OverflowPanelItem key={index} {...panelItemProps} />;
        }
      })}
    </div>
  );
});
