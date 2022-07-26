import {
  forwardRef,
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useTabs } from "./useTabs";
import { Tabstrip } from "./Tabstrip";
import { FocusAPI, TabstripProps } from "./TabsTypes";

import "./Tabs.css";

const withBaseName = makePrefixer("uitkTabs");

export type TabsProps = Omit<TabstripProps, "defaultSource">;

export const Tabs = forwardRef(function Tabs(
  {
    activeTabIndex: activeTabIndexProp,
    allowDragDrop,
    centered,
    children,
    className,
    defaultActiveTabIndex,
    editing,
    emphasis,
    enableAddTab,
    enableCloseTab,
    enableRenameTab,
    onActiveChange: onActiveChangeProp,
    onAddTab,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMoveTab,
    overflowMenu,
    ...htmlAttributes
  }: TabsProps,
  forwardedRef: ForwardedRef<FocusAPI>
) {
  const tabstripRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    forwardedRef,
    () =>
      ({
        focus: () => tabstripRef.current?.focus(),
      } as FocusAPI),
    []
  );

  const { id, onActiveChange, activeTabIndex, tabPanel, tabs } = useTabs({
    activeTabIndex: activeTabIndexProp,
    children,
    defaultActiveTabIndex,
    onActiveChange: onActiveChangeProp,
  });

  const tabstripProps = {
    activeTabIndex,
    allowDragDrop,
    centered,
    editing,
    emphasis,
    enableAddTab,
    enableCloseTab,
    enableRenameTab,
    onAddTab,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMoveTab,
    overflowMenu,
  };
  const getTabPanelId = useCallback(
    (tabIndex: number) => {
      if (tabIndex === activeTabIndex) {
        return `${id}-${tabIndex}-panel`;
      }
    },
    [id, activeTabIndex]
  );

  // TODO need to inject aria-controls
  return (
    <div
      {...htmlAttributes}
      className={cx(withBaseName(), className)}
      id={`${id}-tabs`}
    >
      <Tabstrip
        {...tabstripProps}
        id={id}
        onActiveChange={onActiveChange}
        ref={tabstripRef}
        source={tabs}
      />
      {tabPanel}
    </div>
  );
});
