import { FormField } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import OverflowMenu from "../responsive/overflow-menu/OverflowMenu";
import { useOverflowLayout } from "../responsive/useOverflowLayout";
import { renderTrayTools } from "./internal/renderTrayTools";
import { ensureChildrenHaveIds } from "./internal/toolUtils";
import useKeyboardNavigation from "./internal/useKeyboardNavigation";
import { TooltrayProps } from "./TooltrayProps";

import "./Tooltray.css";

const Tooltray: React.FC<TooltrayProps> = (props) => {
  const {
    OverflowButtonProps,
    "aria-label": ariaLabel,
    children,
    className: classNameProp,
    collapse: collapseProp,
    collapsed: collapsedProp,
    disabled = false,
    "data-collapsible": collapse = collapseProp,
    "data-collapsed": collapsed = collapsedProp,
    isInsidePanel = false,
    overflowButtonIcon,
    overflowButtonLabel,
    orientation = "horizontal",
    ...rest
  } = props;

  const className = cx(
    "uitkTooltray",
    classNameProp,
    `uitkTooltray-${orientation}`,
    { "uitkTooltray-tooltrayOverflowed": isInsidePanel }
  );

  const childrenWithIds = ensureChildrenHaveIds(children, "tooltray");

  // const buttonDescriptors = useToolbarButtonDescriptors(
  //   childrenWithIds,
  //   disabled /* isToolbarDisabled */
  // );
  const [innerContainerRef, managedItems] = useOverflowLayout(
    orientation,
    /*, buttonDescriptors,*/ "Tooltray"
  );
  const overflowedItems = managedItems.filter((item) => item.overflowed);

  const overflowMenuItems = overflowedItems
    .map((i) => childrenWithIds[i.index])
    .reverse();

  const insidePanelItems = useMemo(
    () =>
      overflowedItems.map((i, index) => ({
        index: i.index,
        isTooltray: overflowMenuItems[index]?.type === Tooltray,
      })),
    [overflowMenuItems, overflowedItems]
  );

  const focusableItems = useRef<HTMLElement[]>([]);
  const visibleItems = useRef<HTMLElement[]>([]);

  // TODO a lot of this is repeated in ToolbarBase
  const setToolItems = useCallback(() => {
    const container = innerContainerRef.current;
    if (container) {
      focusableItems.current = Array.from(
        container.querySelectorAll('[tabindex = "0"]')
      );

      visibleItems.current = Array.from(container.children).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (visible: HTMLElement[], child: any, index): HTMLElement[] => {
          if (!insidePanelItems.some((item) => item.index === index)) {
            // spread if it is a tooltray
            const trayItems: HTMLElement[] = Array.from(
              child.querySelectorAll('[tabindex = "0"]')
            );
            if (trayItems.length > 0) {
              trayItems.map((item: HTMLElement) => visible.push(item));
            } else {
              visible.push(child);
            }
          }
          return visible;
        },
        []
      );
    }
  }, [innerContainerRef, insidePanelItems]);

  useEffect(() => {
    setToolItems();
  }, [setToolItems]);

  const handleKeyDown = useKeyboardNavigation(visibleItems);

  const renderOverflow = (menuItems: React.ReactElement[]) => (
    <FormField
      className={cx("toolbar-item", "uitkEmphasisLow")}
      data-index={visibleItems.current.length}
      data-overflow-indicator
      data-pad-start
      data-priority={1}
      fullWidth={false}
    >
      <OverflowMenu
        {...OverflowButtonProps}
        aria-haspopup
        aria-label={ariaLabel || "tooltray overflow"}
        className="Tooltray-overflowMenu"
        data-index={menuItems.length - 1}
        data-priority={1}
        key="overflow"
        onKeyDown={handleKeyDown}
        orientation={orientation}
        overflowButtonIcon={overflowButtonIcon}
        overflowButtonLabel={overflowButtonLabel}
        menuItems={menuItems}
      />
    </FormField>
  );

  const childIsInstantCollapsed = !isInsidePanel && collapsed === true;
  const getInstantChildren = (items: React.ReactElement[]) =>
    childIsInstantCollapsed ? renderOverflow(items) : items;
  const tooltrayItems: ReactElement[] = React.Children.toArray(
    collapse === "instant" ? getInstantChildren(childrenWithIds) : children
  ).filter(React.isValidElement);

  // bring them back when we get into overflow
  const tooltrayProps = {
    className,
    "data-collapsed": collapsed,
    "data-collapsible": collapse,
  };

  return (
    <div {...rest} {...tooltrayProps}>
      <div className={cx("Responsive-inner")} ref={innerContainerRef}>
        {renderTrayTools(
          tooltrayItems,
          isInsidePanel,
          overflowedItems,
          orientation
        )}
        {overflowedItems.length > 0 ? renderOverflow(overflowMenuItems) : null}
      </div>
    </div>
  );
};

export default Tooltray;
