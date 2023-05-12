import { Button, makePrefixer, useControlled } from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import clsx from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dropdown } from "../dropdown";
import { ListItem } from "../list";
import { Tab } from "../tabs/Tab";
import { TabActivationIndicator } from "../tabs/TabActivationIndicator";
import { TabElement, TabProps } from "../tabs/TabsTypes";
import "./TabstripNext.css";

const noop = () => undefined;

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === Tab;
}

export type TabstripNextProps = PropsWithChildren<{
  activeTabIndex?: number;
  onActiveChange?: (index?: number) => void;
  defaultActiveTabIndex?: number;
  align?: "center";
  /* Triggered when tabs should be reordered to make the overflowed tab visible */
  onMoveTab?: (from: number, to: number) => void;
  /* Set a tab max-width in order to enable tab truncation */
  tabMaxWidth?: number;
  /* Enable to make the tabs scroll instead of showing the overflow dropdown menu */
  scrollable?: boolean;
}>;

export const TabstripNext = ({
  children,
  activeTabIndex: activeTabIndexProp,
  defaultActiveTabIndex,
  onActiveChange,
  align,
  onMoveTab,
  scrollable,
  tabMaxWidth,
}: TabstripNextProps) => {
  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex,
    name: "useTabs",
    state: "activeTabIndex",
  });
  const activeTabId =
    activeTabIndex !== undefined ? `tab-${activeTabIndex}` : undefined;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [overflowTabsLength, setOverflowTabsLength] = useState(0);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState(-1);
  const [showOverflow, setShowOverflow] = useState(false);

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const resize = new ResizeObserver(
      ([{ contentRect: outerRect }, { contentRect: innerRect }]) => {
        if (!outerRef.current || !innerRef.current) return;
        if (scrollable) {
          const diff = innerRect.width - outerRect.width;
          if (diff > 1) {
            // TODO: do something with scroll overflow
          }
        } else {
          const diff = innerRect.height - outerRect.height;
          const shouldOverflow = diff > 0;
          setHasOverflow(shouldOverflow);
          const tabsTopOffset = innerRef.current.getBoundingClientRect().top;
          const overflowLength = [
            ...outerRef.current.querySelectorAll(
              `.${withBaseName("inner")} > *`
            ),
          ].filter((el) => {
            return el.getBoundingClientRect().top - tabsTopOffset > 0;
          }).length;
          setOverflowTabsLength(overflowLength);
        }
      }
    );
    resize.observe(outerRef.current);
    resize.observe(innerRef.current);

    return () => {
      resize.disconnect();
    };
  }, [scrollable]);

  const tabs = Children.toArray(children);

  return (
    <div
      className={clsx(withBaseName(), withBaseName("horizontal"), {
        [withBaseName("centered")]: align === "center",
        [withBaseName("scrollable")]: scrollable,
      })}
      ref={outerRef}
    >
      <div className={withBaseName("inner")} ref={innerRef}>
        {tabs.map((child, index) => {
          if (!isTab(child)) return child;
          const id = `tab-${index}`;
          return cloneElement<TabProps>(child, {
            draggable: true,
            id: id,
            style: {
              maxWidth: tabMaxWidth,
            },
            tabIndex: index === activeTabIndex ? 0 : -1,
            selected: index === activeTabIndex,
            index: index,
            onClick: () => {
              setActiveTabIndex(index);
              onActiveChange?.(index);
            },
            onKeyUp: noop,
            onKeyDown: (e) => {
              let nextId;
              if (e.key === "ArrowRight") {
                const nextIsOverflowed =
                  index + 1 >= tabs.length - overflowTabsLength;
                if (nextIsOverflowed) {
                  outerRef?.current
                    ?.querySelector<HTMLDivElement>(`.saltDropdown .saltButton`)
                    ?.focus();
                  return;
                } else {
                  nextId = `#tab-${index + 1}`;
                  setKeyboardFocusedIndex(index + 1);
                }
              }
              if (e.key === "ArrowLeft") {
                nextId = `#tab-${index - 1}`;
                setKeyboardFocusedIndex(index - 1);
              }
              if (nextId && innerRef.current) {
                innerRef.current.querySelector<HTMLDivElement>(nextId)?.focus();
              }
              if (e.key === "Enter" || e.key === " ") {
                const nextIndex =
                  keyboardFocusedIndex < 0
                    ? activeTabIndex
                    : keyboardFocusedIndex;
                setActiveTabIndex(nextIndex);
                onActiveChange?.(nextIndex);
              }
            },
          });
        })}
      </div>
      {hasOverflow ? (
        <Dropdown
          data-overflow-indicator
          data-priority={0}
          isOpen={showOverflow}
          key="overflow"
          onOpenChange={(open) => {
            setShowOverflow(open);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              const nextIndex = tabs.length - overflowTabsLength - 1;
              setActiveTabIndex(nextIndex);
              innerRef?.current
                ?.querySelector<HTMLDivElement>(`#tab-${nextIndex}`)
                ?.focus();
              setShowOverflow(false);
            }
          }}
          onSelectionChange={(e) => {
            console.log("onSelectionChange", e.currentTarget as HTMLDivElement);
          }}
          placement="bottom-end"
          source={tabs
            .slice(tabs.length - overflowTabsLength, tabs.length)
            .map((tab, index) => {
              if (!isTab(tab)) return tab;
              return (
                <ListItem
                  data-index={index}
                  label={tab.props.label}
                  onClick={() => {
                    if (onMoveTab) {
                      const from = tabs.length - overflowTabsLength + index;
                      const to = tabs.length - overflowTabsLength - 1;
                      onMoveTab(from, to);
                      onActiveChange?.(to);
                      setActiveTabIndex(to);
                    } else {
                      const nextIndex =
                        tabs.length - overflowTabsLength + index;
                      setActiveTabIndex(nextIndex);
                      onActiveChange?.(nextIndex);
                    }
                  }}
                >
                  {tab.props.children}
                </ListItem>
              );
            })}
          selected={null}
          style={{ alignSelf: "center" }}
          triggerComponent={
            <Button
              aria-label={`Tabs overflow menu ${overflowTabsLength} item${
                overflowTabsLength === 1 ? "" : "s"
              }`}
              variant="secondary"
              tabIndex={-1}
            >
              <OverflowMenuIcon style={{ margin: 0 }} />
            </Button>
          }
          width="auto"
        />
      ) : null}

      <TabActivationIndicator orientation="horizontal" tabId={activeTabId} />
    </div>
  );
};

export const TabNext = Tab;
