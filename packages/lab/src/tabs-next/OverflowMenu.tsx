import { isValidElement, ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  limitShift,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { Button, makePrefixer, SaltProvider } from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { ListItem } from "../list";
import { isDesktop } from "../window";
import { TabElement } from "../tabs/TabsTypes";
import { Tab } from "../tabs/Tab";

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === Tab;
}

export function OverflowMenu({
  tabs,
  overflowTabsLength,
  onMoveTab,
  activeTabIndex,
  onActiveChange,
  setActiveTabIndex,
  getTabId,
  setKeyboardFocusedIndex,
}: {
  tabs: ReactNode[];
  overflowTabsLength: number;
  onMoveTab?: (from: number, to: number) => void;
  activeTabIndex?: number | null;
  onActiveChange?: (index: number) => void;
  setActiveTabIndex: (index: number) => void;
  getTabId: (index?: number) => string;
  setKeyboardFocusedIndex: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (open) return;
    setHighlightedIndex(0);
  }, [open]);

  const [maxPopupHeight, setMaxPopupHeight] = useState<number | undefined>();
  const indexToSelect = tabs.length - overflowTabsLength + highlightedIndex!;

  const middleware = isDesktop
    ? []
    : [
        flip({
          fallbackPlacements: ["bottom-start", "top-start"],
        }),
        shift({ limiter: limitShift() }),
        size({
          apply({ availableHeight }) {
            setMaxPopupHeight(availableHeight);
          },
        }),
      ];

  const { refs, x, y, strategy, context } = useFloating({
    open,
    middleware,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement: "bottom-end",
  });
  const listRef = useRef<Array<HTMLDivElement | null>>([]);
  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });

  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex: highlightedIndex,
    selectedIndex: activeTabIndex,
    onNavigate: setHighlightedIndex,
    virtual: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [listNavigation, dismiss, click, role]
  );

  function select() {
    const nextIndex = tabs.length - overflowTabsLength - 1;
    setActiveTabIndex(nextIndex);
    onActiveChange?.(nextIndex);
    onMoveTab?.(indexToSelect, nextIndex);
    setOpen(false);

    // we are battling the floating ui here
    setTimeout(() => {
      moveBackToTabs();
    }, 10);
  }

  function moveBackToTabs() {
    const moveToIndex = tabs.length - overflowTabsLength - 1;
    setKeyboardFocusedIndex(moveToIndex);
    document.getElementById(getTabId(moveToIndex))?.focus();
  }

  return (
    <div className={withBaseName("overflowMenu")}>
      {open ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <SaltProvider>
              <div
                style={{
                  top: y ?? 0,
                  left: x ?? 0,
                  position: strategy,
                  maxHeight: maxPopupHeight ?? undefined,
                }}
                ref={refs.setFloating}
                {...getFloatingProps({
                  onKeyDown(event) {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      select();
                    }

                    if (event.key === " ") {
                      event.preventDefault();
                      select();
                    }

                    if (event.key === "ArrowLeft") {
                      moveBackToTabs();
                    }
                  },
                })}
                className={clsx(withBaseName("overflowMenu-popup"), "saltList")}
              >
                {tabs
                  .slice(tabs.length - overflowTabsLength, tabs.length)
                  .map((tab, index) => {
                    if (!isTab(tab)) return tab;
                    const label =
                      typeof tab.props.children === "string"
                        ? tab.props.children
                        : tab.props.label;

                    if (!label) {
                      throw new Error("Tab needs a label or a children string");
                    }

                    return (
                      <ListItem
                        key={label}
                        ref={(node) => {
                          listRef.current[index] = node;
                        }}
                        role="option"
                        selected={
                          activeTabIndex ===
                          tabs.length - overflowTabsLength + index
                        }
                        className={clsx(`saltListItem`, {
                          saltHighlighted: highlightedIndex === index,
                        })}
                        label={label}
                        tabIndex={-1}
                        {...getItemProps({
                          onClick: select,
                        })}
                        id={`${getTabId()}${label}-option`}
                      >
                        {tab.props.children}
                      </ListItem>
                    );
                  })}
              </div>
            </SaltProvider>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}

      <Button
        tabIndex={-1}
        ref={refs.setReference}
        aria-autocomplete="none"
        {...getReferenceProps({
          onKeyDown: (e) => {
            if (e.key === "ArrowLeft") {
              moveBackToTabs();
            }
          },
        })}
        aria-label={`Tabs overflow menu ${overflowTabsLength} item${
          overflowTabsLength === 1 ? "" : "s"
        }`}
        variant="secondary"
      >
        <OverflowMenuIcon style={{ margin: 0 }} />
      </Button>
    </div>
  );
}
