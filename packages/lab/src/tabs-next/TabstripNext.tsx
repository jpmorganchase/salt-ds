import { makePrefixer, useControlled } from "@salt-ds/core";
import clsx from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TabNext } from "./TabNext";
import { TabElement, TabProps } from "../tabs/TabsTypes";
import { OverflowMenu } from "./OverflowMenu";
import tabstripCss from "./TabstripNext.css";
import { SelectionChangeHandler } from "../common-hooks";
import { Overflow, OverflowItem } from "@fluentui/react-overflow";

const noop = () => undefined;

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabNext;
}

export type TabstripNextProps = PropsWithChildren<{
  activeTab?: string | null;
  onActiveChange?: (id?: string) => void;
  defaultActiveTab?: string;
  align?: "center";
  /* Set a tab max-width in order to enable tab truncation */
  tabMaxWidth?: number;
  variant?: "primary" | "secondary";
}>;

export const TabstripNext = ({
  children,
  activeTab: activeTabProp,
  defaultActiveTab,
  onActiveChange,
  align,
  tabMaxWidth,
  variant = "primary",
}: TabstripNextProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabstrip-next",
    css: tabstripCss,
    window: targetWindow,
  });
  const tabs = Children.toArray(children).filter(isTab);

  const [activeTab, setActiveTab] = useControlled({
    controlled: activeTabProp,
    default: defaultActiveTab,
    name: "useTabs",
    state: "activeTabIndex",
  });
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleOverflowMenuSelectionChange: SelectionChangeHandler<{
    label: string;
    id: string;
  }> = (event, item) => {
    if (item) {
      setActiveTab(item.id);
      onActiveChange?.(item.id);
    }
  };

  return (
    <Overflow>
      <div
        role="tablist"
        className={clsx(
          withBaseName(),
          withBaseName("horizontal"),
          [withBaseName(`variant-${variant}`)],
          {
            [withBaseName("centered")]: align === "center",
          }
        )}
        ref={outerRef}
      >
        {tabs.map((child) => {
          const label =
            typeof child.props.children === "string"
              ? child.props.children
              : child.props.label;
          const id = child.props.id!;
          const isActive = activeTab === id;
          return (
            <OverflowItem key={id} id={id} priority={isActive ? 2 : 1}>
              {cloneElement<TabProps>(child, {
                id: id,
                style: {
                  maxWidth: tabMaxWidth,
                },
                label,
                tabIndex: isActive ? 0 : -1,
                selected: isActive,
                onClick: () => {
                  setActiveTab(id);
                  onActiveChange?.(id);
                },
                onKeyUp: noop,
                onKeyDown: (e) => {
                  let nextId;
                  // if (e.key === "ArrowRight") {
                  //   const nextIsOverflowed =
                  //     index + 1 >= tabs.length - overflowTabsLength;
                  //   if (nextIsOverflowed) {
                  //     outerRef?.current
                  //       ?.querySelector<HTMLDivElement>(
                  //         `.${withBaseName("overflowMenu")} .saltButton`
                  //       )
                  //       ?.focus();
                  //     return;
                  //   } else {
                  //     nextId = getTabId(index + 1);
                  //     setKeyboardFocusedIndex(index + 1);
                  //   }
                  // }
                  // if (e.key === "ArrowLeft") {
                  //   nextId = getTabId(index - 1);
                  //   setKeyboardFocusedIndex(index - 1);
                  // }
                  // if (nextId && innerRef.current) {
                  //   (document.getElementById(nextId) as HTMLDivElement)?.focus();
                  // }
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveTab(id);
                    onActiveChange?.(id);
                  }
                },
              })}
            </OverflowItem>
          );
        })}
        <OverflowMenu
          tabs={tabs}
          onSelectionChange={handleOverflowMenuSelectionChange}
        />
      </div>
    </Overflow>
  );
};
