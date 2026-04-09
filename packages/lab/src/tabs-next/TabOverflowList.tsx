import {
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useInteractions,
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
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type Dispatch,
  forwardRef,
  type Ref,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";
import tabOverflowListCss from "./TabOverflowList.css";
import { TabSlot } from "./TabSlot";
import { useTabsNext } from "./TabsNextContext";
import {
  getMeasuredWidth,
  seedWidthMap,
  updateWidthMap,
} from "./widthMeasurement";

interface TabOverflowListProps extends ComponentPropsWithoutRef<"button"> {
  buttonRef?: Ref<HTMLButtonElement>;
  hiddenValues: string[];
  isMeasuring?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  order: number;
}

const withBaseName = makePrefixer("saltTabOverflow");

export const TabOverflowList = forwardRef<HTMLDivElement, TabOverflowListProps>(
  function TabOverflowList(props, ref) {
    const {
      buttonRef,
      className,
      hiddenValues,
      isMeasuring,
      order,
      open,
      setOpen,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs-next-overflow-list",
      css: tabOverflowListCss,
      window: targetWindow,
    });

    const overflowRef = useRef<HTMLButtonElement>(null);
    const hadOverflowItemsRef = useRef(false);

    const { OverflowIcon } = useIcon();
    const { registerTab, updateTab, activeTab } = useTabsNext();

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
        shift({
          padding: 8,
        }),
      ],
    });

    const { getFloatingProps, getReferenceProps } = useInteractions([
      useClick(context),
      useDismiss(context),
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

    const overflowItemCount = hiddenValues.length;
    const hasOverflowItems = overflowItemCount > 0;
    const initialOrderRef = useRef(order);

    useEffect(() => {
      const tabList = overflowRef.current?.parentElement;
      const resizeObserverCtor = (
        targetWindow as
          | (Window & { ResizeObserver?: typeof ResizeObserver })
          | undefined
      )?.ResizeObserver;
      if (!open || !tabList || !resizeObserverCtor) {
        return;
      }

      const observedElements = [tabList, tabList.parentElement].filter(
        (element): element is HTMLElement => element != null,
      );
      const widths = seedWidthMap(observedElements);

      const resizeObserver = new resizeObserverCtor(
        (entries: ResizeObserverEntry[]) => {
          for (const entry of entries) {
            if (!(entry.target instanceof HTMLElement)) {
              continue;
            }

            const nextWidth =
              entry.contentRect.width || getMeasuredWidth(entry.target);
            if (updateWidthMap(widths, entry.target, nextWidth)) {
              setOpen(false);
              return;
            }
          }
        },
      );

      for (const element of observedElements) {
        resizeObserver.observe(element);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [open, setOpen, targetWindow]);

    useIsomorphicLayoutEffect(() => {
      if (open && !hasOverflowItems) {
        setOpen(false);
      }
    }, [hasOverflowItems, open, setOpen]);

    useIsomorphicLayoutEffect(() => {
      if (hasOverflowItems && !hadOverflowItemsRef.current) {
        setOpen(false);
      }

      hadOverflowItemsRef.current = hasOverflowItems;
    }, [hasOverflowItems, setOpen]);

    useIsomorphicLayoutEffect(() => {
      if (overflowId && overflowRef.current && hasOverflowItems) {
        const item = {
          id: overflowId,
          value: overflowId,
          element: overflowRef.current,
          location: "main" as const,
          order: initialOrderRef.current,
        };

        return registerTab(item);
      }
    }, [hasOverflowItems, overflowId, registerTab]);

    useIsomorphicLayoutEffect(() => {
      if (!overflowId || !hasOverflowItems) {
        return;
      }

      updateTab(overflowId, {
        element: overflowRef.current,
        location: "main",
        order,
      });
    }, [hasOverflowItems, order, overflowId, updateTab]);

    if (!hasOverflowItems && !isMeasuring) return null;

    return (
      <>
        <Button
          className={clsx(withBaseName(), className)}
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
                  initialFocus: -1,
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
            aria-orientation="vertical"
            className={withBaseName("listContainer")}
          >
            {hiddenValues.map((value) => (
              <TabSlot key={value} slotId={`overflow:${value}`} value={value} />
            ))}
          </div>
        </FloatingComponent>
      </>
    );
  },
);
