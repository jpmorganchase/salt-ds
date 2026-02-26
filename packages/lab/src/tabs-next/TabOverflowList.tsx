import {
  FloatingList,
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useInteractions,
  useListNavigation,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useIcon,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ComponentPropsWithoutRef,
  type Dispatch,
  forwardRef,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TabOverflowContext } from "./TabOverflowContext";
import tabOverflowListCss from "./TabOverflowList.css";
import { useTabsNext } from "./TabsNextContext";

interface TabOverflowListProps extends ComponentPropsWithoutRef<"button"> {
  buttonRef?: Ref<HTMLButtonElement>;
  children?: ReactNode;
  isMeasuring?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const withBaseName = makePrefixer("saltTabOverflow");

interface UseOverflowOpenFocusRecoveryArgs {
  open: boolean;
  targetWindow: Window | null | undefined;
  floatingRef: MutableRefObject<HTMLElement | null>;
  listNavigationRef: MutableRefObject<(HTMLButtonElement | null)[]>;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
}

function useOverflowOpenFocusRecovery({
  open,
  targetWindow,
  floatingRef,
  listNavigationRef,
  setActiveIndex,
}: UseOverflowOpenFocusRecoveryArgs) {
  useEffect(() => {
    if (!open || !targetWindow) return;

    let raf1: number | null = null;
    let raf2: number | null = null;

    const restoreFocus = () => {
      const floating = floatingRef.current;
      const active = targetWindow.document.activeElement as HTMLElement | null;

      const isMenuTabFocused =
        !!active &&
        active.isConnected &&
        active.getAttribute("role") === "tab" &&
        !!floating &&
        floating.contains(active);

      if (isMenuTabFocused) {
        return;
      }

      const items = listNavigationRef.current.filter(
        (item): item is HTMLButtonElement => !!item,
      );
      const firstItem = items[0];
      if (!firstItem) return;

      // Keep Floating UI list navigation state aligned with the item we
      // programmatically focus.
      setActiveIndex(0);
      firstItem.focus();
    };

    // The overflow list can remount items after open; run once after mount and
    // once more on the next frame to recover focus if it drops back to body.
    raf1 = requestAnimationFrame(() => {
      restoreFocus();
      raf2 = requestAnimationFrame(restoreFocus);
    });

    return () => {
      if (raf1 != null) cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
    };
  }, [floatingRef, listNavigationRef, open, setActiveIndex, targetWindow]);
}

export const TabOverflowList = forwardRef<HTMLDivElement, TabOverflowListProps>(
  function TabOverflowList(props, ref) {
    const { buttonRef, children, isMeasuring, open, setOpen, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs-next-overflow-list",
      css: tabOverflowListCss,
      window: targetWindow,
    });

    const overflowRef = useRef<HTMLButtonElement>(null);

    const { OverflowIcon } = useIcon();
    const { registerTab, activeTab } = useTabsNext();

    const { refs, x, y, strategy, context, elements } = useFloatingUI({
      open: open,
      onOpenChange(open, _, reason) {
        setOpen(open);

        if (reason === "escape-key") {
          overflowRef.current?.focus();
        }
      },
      placement: "bottom-start",
      middleware: [
        offset(1),
        size({
          apply({ elements, availableHeight }) {
            Object.assign(elements.floating.style, {
              maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
            });
          },
        }),
        flip(),
      ],
    });

    const listNavigationRef = useRef<HTMLButtonElement[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const { getFloatingProps, getReferenceProps } = useInteractions([
      useClick(context),
      useDismiss(context),
    ]);

    const { getFloatingProps: getListFloatingProps, getItemProps } =
      useInteractions([
        useListNavigation(context, {
          listRef: listNavigationRef,
          activeIndex,
          onNavigate: setActiveIndex,
          loop: true,
          scrollItemIntoView: { block: "nearest", inline: "nearest" },
          focusItemOnOpen: true,
        }),
      ]);

    const handleListRef = useForkRef<HTMLDivElement>(ref, refs.setFloating);

    const handleButtonRef = useForkRef<HTMLButtonElement>(
      buttonRef,
      refs.setReference,
    );
    const handleRef = useForkRef(handleButtonRef, overflowRef);

    const { Component: FloatingComponent } = useFloatingComponent();

    const overflowId = useId();
    const overlayId = useId();

    const handleFocus = () => {
      if (overflowId) {
        activeTab.current = { value: overflowId, id: overflowId };
      }
    };

    const childCount = Children.count(children);
    const hasOverflowItems = childCount > 0;

    useOverflowOpenFocusRecovery({
      open,
      targetWindow,
      floatingRef: refs.floating,
      listNavigationRef,
      setActiveIndex,
    });

    useIsomorphicLayoutEffect(() => {
      if (overflowId && overflowRef.current && hasOverflowItems) {
        return registerTab({
          id: overflowId,
          value: overflowId,
          element: overflowRef.current,
        });
      }
    }, [overflowId, registerTab, hasOverflowItems]);

    const overflowContext = useMemo(
      () => ({ activeIndex, getItemProps }),
      [activeIndex, getItemProps],
    );

    if (!hasOverflowItems && !isMeasuring) return null;

    return (
      <TabOverflowContext.Provider value={overflowContext}>
        <div className={withBaseName()} data-overflow>
          <Button
            data-overflowbutton
            appearance="transparent"
            sentiment="neutral"
            {...getReferenceProps({
              onFocus: handleFocus,
            })}
            ref={handleRef}
            aria-label="Overflow"
            aria-haspopup
            aria-expanded={open}
            aria-controls={overlayId}
            role="tab"
            tabIndex={-1}
            {...rest}
          >
            <OverflowIcon aria-hidden />
          </Button>
          <FloatingList elementsRef={listNavigationRef}>
            <FloatingComponent
              ref={handleListRef}
              {...getFloatingProps({
                "aria-modal": true,
                role: "dialog",
                id: overlayId,
              })}
              aria-label="Overflow Menu"
              focusManagerProps={
                context
                  ? {
                      context,
                      returnFocus: false,
                      modal: true,
                    }
                  : undefined
              }
              className={withBaseName("list")}
              open={open}
              left={x ?? 0}
              top={y ?? 0}
              position={strategy}
              width={elements.floating?.offsetWidth}
              height={elements.floating?.offsetHeight}
            >
              <div
                role="tablist"
                {...getListFloatingProps()}
                className={withBaseName("listContainer")}
              >
                {children}
              </div>
            </FloatingComponent>
          </FloatingList>
        </div>
      </TabOverflowContext.Provider>
    );
  },
);
