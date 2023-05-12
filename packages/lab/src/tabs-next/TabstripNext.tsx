import { makePrefixer, useControlled } from "@salt-ds/core";
import clsx from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
  ReactNode,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { Overflow, OverflowItem } from "@fluentui/react-overflow";
import { TabNext } from "./TabNext";
import { TabElement, TabProps } from "./TabsNextTypes";
import { OverflowMenu } from "./OverflowMenu";
import tabstripCss from "./TabstripNext.css";

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabNext;
}

export type TabstripNextProps = PropsWithChildren<{
  /* Value for the uncontrolled version. Set to null in order to have no tabs be selected. */
  selectedTab?: string | null;
  /* Callback for the controlled version. */
  onSelectTab?: (
    e: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>,
    value: string
  ) => void;
  /* Initial value for the uncontrolled version. Set to null in order to have no tabs be selected by default. */
  defaultSelectedTab?: string | null;
  /* Align the tabs to the center. Left aligned by default. */
  align?: "left" | "center";
  /* Set a tab max-width in order to enable tab truncation */
  tabMaxWidth?: number;
}>;

export const TabstripNext = ({
  children,
  selectedTab: selectedTabProp,
  defaultSelectedTab,
  onSelectTab,
  align,
  tabMaxWidth,
}: TabstripNextProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabstrip-next",
    css: tabstripCss,
    window: targetWindow,
  });
  const tabs = Children.toArray(children)
    .filter(isTab)
    .map((tab) => {
      return { tab, value: tab.props.value };
    });

  const [selectedTab, setSelectedTabId] = useControlled({
    controlled: selectedTabProp,
    // we want to make it possible for no tabs to be selected
    // but it has to be set explicitly by the user by setting default or controlled value to null
    default:
      defaultSelectedTab === null
        ? undefined
        : defaultSelectedTab ?? tabs[0].value,
    name: "TabstripNext",
    state: "selectedTab",
  });
  const [focusedId, setFocusedId] = useState(selectedTab);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const handleOverflowMenuSelectionChange = (
    event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>,
    selectedId: string
  ) => {
    setSelectedTabId(selectedId);
    onSelectTab?.(event, selectedId);
  };

  return (
    <div
      role="tablist"
      className={clsx(withBaseName(), withBaseName("horizontal"), {
        [withBaseName("centered")]: align === "center",
      })}
      ref={outerRef}
    >
      <Overflow>
        <div className={withBaseName("inner")} ref={innerRef}>
          {tabs.map(({ tab, value }, index) => {
            const { label } = tab.props;
            const isActive = selectedTab === value;
            const noTabSelected = typeof selectedTab !== "string";
            return (
              <OverflowItem
                id={value}
                priority={isActive ? 1000 : undefined}
                key={label}
              >
                <div className={withBaseName("tabWrapper")}>
                  {cloneElement<TabProps>(tab, {
                    style: {
                      maxWidth: tabMaxWidth,
                    },
                    label,
                    value,
                    tabIndex:
                      // when no tab is active, the first tab should be focusable
                      focusedId === value || (noTabSelected && index === 0)
                        ? 0
                        : -1,
                    selected: isActive,
                    index,
                    onClick: (e) => {
                      setSelectedTabId(value);
                      onSelectTab?.(e, value);
                    },
                    onFocus: () => {
                      setFocusedId(value);
                    },
                    onKeyDown: (e) => {
                      // Here we are selecting visible tabs and the overflow menu button since these should be keyboard navigable
                      // We discern visibility by checking if the tab has the data-overflowing attribute which is added
                      // by the overflow component
                      const focusableElements = Array.from(
                        outerRef.current?.querySelectorAll<HTMLDivElement>(
                          `[data-overflow-item]:not([data-overflowing]) [role="tab"], [data-overflow-menu] button`
                        ) ?? []
                      );
                      const focusableIndex =
                        focusableElements.findIndex((tabElement) => {
                          return value === tabElement.dataset.value;
                        }) ?? focusableElements.length - 1;
                      if (
                        e.key === "ArrowRight" &&
                        focusableElements[focusableIndex + 1]
                      ) {
                        focusableElements[focusableIndex + 1]?.focus();
                      }

                      if (e.key === "ArrowLeft") {
                        focusableElements[focusableIndex - 1]?.focus();
                      }

                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedTabId(value);
                        onSelectTab?.(e, value);
                      }
                    },
                  })}
                </div>
              </OverflowItem>
            );
          })}
          <OverflowItem id="menu" priority={9999}>
            <OverflowMenu
              tabs={tabs}
              onSelectItem={handleOverflowMenuSelectionChange}
              returnFocusToTabs={() => {
                const focusable =
                  outerRef.current?.querySelectorAll<HTMLDivElement>(
                    `[data-overflow-item]:not([data-overflowing]) [role="tab"]`
                  ) ?? [];
                focusable[focusable.length - 1]?.focus();
              }}
            />
          </OverflowItem>
        </div>
      </Overflow>
    </div>
  );
};
