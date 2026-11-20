import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import tabsCss from "./Tabs.css";
import type { FocusAPI, TabstripProps } from "./TabsTypes";
import { Tabstrip } from "./Tabstrip";
import { useTabs } from "./useTabs";

const withBaseName = makePrefixer("saltTabs");

export interface TabsProps
  extends Omit<TabstripProps, "defaultSource" | "source"> {
  /**
   * The ID of the tab list. The root element's ID is `${id}-tabs`, and the IDs of the tabs and panels start with it. When not set, an ID is generated.
   */
  id?: string;
}

export const Tabs = forwardRef(function Tabs(
  {
    activeTabIndex: activeTabIndexProp,
    allowDragDrop,
    centered,
    children,
    className,
    defaultActiveTabIndex,
    editing,
    enableAddTab,
    enableCloseTab,
    enableRenameTab,
    id: idProp,
    keyBoardActivation,
    onActiveChange: onActiveChangeProp,
    onAddTab,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMoveTab,
    orientation,
    overflowMenu,
    promptForNewTabName,
    showActivationIndicator,
    variant,
    ...htmlAttributes
  }: TabsProps,
  forwardedRef: ForwardedRef<FocusAPI>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabs",
    css: tabsCss,
    window: targetWindow,
  });

  const tabstripRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    forwardedRef,
    () =>
      ({
        focus: () => tabstripRef.current?.focus(),
      }) as FocusAPI,
    [],
  );

  const { id, onActiveChange, activeTabIndex, tabPanel, tabs } = useTabs({
    activeTabIndex: activeTabIndexProp,
    children,
    defaultActiveTabIndex,
    id: idProp,
    onActiveChange: onActiveChangeProp,
  });

  const tabstripProps = {
    activeTabIndex,
    allowDragDrop,
    centered,
    editing,
    variant,
    enableAddTab,
    enableCloseTab,
    enableRenameTab,
    keyBoardActivation,
    onAddTab,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMoveTab,
    orientation,
    overflowMenu,
    promptForNewTabName,
    showActivationIndicator,
  };

  // TODO need to inject aria-controls
  return (
    <div
      {...htmlAttributes}
      className={clsx(withBaseName(), className)}
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
