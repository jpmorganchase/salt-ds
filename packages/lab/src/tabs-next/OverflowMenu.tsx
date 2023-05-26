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
import { TabNext } from "./TabNext";

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabNext;
}

export function OverflowMenu({
  tabs,
  overflowTabsLength,
  activeTabIndex,
  onSelectIndex,
  getTabId,
  setKeyboardFocusedIndex,
}: {
  tabs: ReactNode[];
  overflowTabsLength: number;
  onMoveTab?: (from: number, to: number) => void;
  activeTabIndex?: number | null;
  onSelectIndex: (index: number) => void;
  getTabId: (index?: number) => string;
  setKeyboardFocusedIndex: (index: number) => void;
}) {
  const visibleTabsLength = tabs.length - overflowTabsLength;
  const overflowHasActiveTab =
    activeTabIndex && activeTabIndex >= visibleTabsLength;
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (open) return;
    setHighlightedIndex(0);
  }, [open]);

  const [maxPopupHeight, setMaxPopupHeight] = useState<number | undefined>();
  const indexToSelect =
    typeof highlightedIndex !== "number"
      ? activeTabIndex
      : visibleTabsLength + highlightedIndex;
  console.log({ open, activeTabIndex, indexToSelect, highlightedIndex });

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
    selectedIndex: overflowHasActiveTab
      ? activeTabIndex - visibleTabsLength
      : activeTabIndex,
    onNavigate: setHighlightedIndex,
    virtual: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [listNavigation, dismiss, click, role]
  );

  function select() {
    if (!indexToSelect) return;
    onSelectIndex(indexToSelect);
  }

  function moveBackToTabs() {
    const moveToIndex = visibleTabsLength - 1;
    setKeyboardFocusedIndex(moveToIndex);
    document
      .getElementById(getTabId(moveToIndex))
      ?.focus({ preventScroll: true });
  }

  return (
    <div
      className={clsx(withBaseName("overflowMenu"), {
        [withBaseName("overflowMenu-active")]: overflowHasActiveTab,
      })}
    >
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
                  .slice(visibleTabsLength, tabs.length)
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
                        selected={activeTabIndex === visibleTabsLength + index}
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
        tabIndex={!open && overflowHasActiveTab ? 0 : -1}
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
