import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import clsx from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tab } from "../tabs/Tab";
import { TabActivationIndicator } from "../tabs/TabActivationIndicator";
import { TabElement, TabProps } from "../tabs/TabsTypes";
import { OverflowMenu } from "./OverflowMenu";
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
}>;

export const TabstripNext = ({
  children,
  activeTabIndex: activeTabIndexProp,
  defaultActiveTabIndex,
  onActiveChange,
  align,
  onMoveTab,
  tabMaxWidth,
}: TabstripNextProps) => {
  const uniqueId = useId();
  const getTabId = useCallback(
    (index?: number) => {
      return `tab-${uniqueId ?? "unknown"}-${index ?? ""}`;
    },
    [uniqueId]
  );

  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex,
    name: "useTabs",
    state: "activeTabIndex",
  });
  const activeTabId =
    activeTabIndex !== undefined ? getTabId(activeTabIndex) : undefined;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const firstSpy = useRef<HTMLDivElement>(null);
  const lastSpy = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [overflowTabsLength, setOverflowTabsLength] = useState(0);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState(-1);

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const resize = new ResizeObserver(() => {
      // we don't use resize observer results because they come in random order and we have refs anyways
      if (!outerRef.current || !innerRef.current) return;
      const hasOverflowingContent =
        innerRef.current.clientHeight - outerRef.current.clientHeight > 0;
      setHasOverflow(hasOverflowingContent);
      const tabsTopOffset = innerRef.current.getBoundingClientRect().top;
      const overflowLength = [
        ...outerRef.current.querySelectorAll(`.${withBaseName("inner")} > *`),
      ].filter((el) => {
        return el.getBoundingClientRect().top - tabsTopOffset > 0;
      }).length;
      setOverflowTabsLength(overflowLength);
    });
    resize.observe(outerRef.current);
    resize.observe(innerRef.current);

    return () => {
      resize.disconnect();
    };
  }, []);

  const tabs = Children.toArray(children);

  return (
    <div
      className={clsx(withBaseName(), withBaseName("horizontal"), {
        [withBaseName("centered")]: align === "center",
      })}
      ref={outerRef}
    >
      <div className={withBaseName("inner")} ref={innerRef}>
        <div ref={firstSpy} style={{ width: 1, height: 1 }}></div>
        {tabs.map((child, index) => {
          if (!isTab(child)) return child;
          const id = getTabId(index);
          return cloneElement<TabProps>(child, {
            // draggable: true,
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
                    ?.querySelector<HTMLDivElement>(
                      `.${withBaseName("overflowMenu")} .saltButton`
                    )
                    ?.focus();
                  return;
                } else {
                  nextId = getTabId(index + 1);
                  setKeyboardFocusedIndex(index + 1);
                }
              }
              if (e.key === "ArrowLeft") {
                nextId = getTabId(index - 1);
                setKeyboardFocusedIndex(index - 1);
              }
              if (nextId && innerRef.current) {
                (document.getElementById(nextId) as HTMLDivElement)?.focus();
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
        <div ref={lastSpy} style={{ width: 1, height: 1 }}></div>
      </div>

      {hasOverflow ? (
        <OverflowMenu
          tabs={tabs}
          activeTabIndex={activeTabIndex}
          overflowTabsLength={overflowTabsLength}
          onMoveTab={onMoveTab}
          onActiveChange={onActiveChange}
          setActiveTabIndex={setActiveTabIndex}
          getTabId={getTabId}
          setKeyboardFocusedIndex={setKeyboardFocusedIndex}
        />
      ) : null}

      <TabActivationIndicator orientation="horizontal" tabId={activeTabId} />
    </div>
  );
};

export const TabNext = Tab;
