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
  type RenderPropsType,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useId,
} from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { BreadcrumbNextContext } from "./BreadcrumbNextContext";
import type { NormalizedBreadcrumb } from "./breadcrumbItems";

const withBaseName = makePrefixer("saltBreadcrumbsNext");

interface BreadcrumbOverflowDisclosureProps {
  currentIndex: number;
  items: NormalizedBreadcrumb[];
  render?: RenderPropsType["render"];
}

export function BreadcrumbOverflowDisclosure({
  currentIndex,
  items,
  render,
}: BreadcrumbOverflowDisclosureProps) {
  const [open, setOpen] = useState(false);
  const targetWindow = useWindow();
  const itemElements = useRef(new Map<number, HTMLAnchorElement>());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const disclosureId = useId();
  const { Component: FloatingComponent } = useFloatingComponent();

  const focusTrigger = useCallback(() => {
    targetWindow?.requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true });
    });
  }, [targetWindow]);

  const getFocusableItems = useCallback(
    () =>
      items
        .map((_, index) => itemElements.current.get(index))
        .filter((item): item is HTMLAnchorElement => item !== undefined),
    [items],
  );

  const focusItem = useCallback(
    (position: "first" | "last") => {
      const focusableItems = getFocusableItems();
      const item =
        position === "first"
          ? focusableItems[0]
          : focusableItems[focusableItems.length - 1];

      item?.focus({ preventScroll: true });
      return item !== undefined;
    },
    [getFocusableItems],
  );

  const focusItemByOffset = useCallback(
    (offset: number) => {
      const focusableItems = getFocusableItems();
      const activeIndex = focusableItems.indexOf(
        targetWindow?.document.activeElement as HTMLAnchorElement,
      );

      if (activeIndex === -1) {
        return focusItem(offset > 0 ? "first" : "last");
      }

      const nextIndex = Math.min(
        Math.max(activeIndex + offset, 0),
        focusableItems.length - 1,
      );

      focusableItems[nextIndex]?.focus({ preventScroll: true });
      return focusableItems[nextIndex] !== undefined;
    },
    [focusItem, getFocusableItems, targetWindow],
  );

  const { context, elements, refs, strategy, x, y } = useFloatingUI({
    open,
    onOpenChange(nextOpen, _event, reason) {
      setOpen(nextOpen);

      if (!nextOpen && reason === "escape-key") {
        focusTrigger();
      }
    },
    placement: "bottom-start",
    middleware: [
      offset(1),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
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
  const handleTriggerRef = useForkRef<HTMLButtonElement>(
    triggerRef,
    refs.setReference,
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (open && (event.key === "ArrowDown" || event.key === "ArrowRight")) {
      event.preventDefault();
      focusItem("first");
      return;
    }

    if (open && (event.key === "ArrowUp" || event.key === "ArrowLeft")) {
      event.preventDefault();
      focusItem("last");
      return;
    }

    if (event.key === "Tab" && open && !event.shiftKey) {
      if (focusItem("first")) {
        event.preventDefault();
      }
      return;
    }
  };

  const handleTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (nextFocusedElement && elements.floating?.contains(nextFocusedElement)) {
      return;
    }

    setOpen(false);
  };

  const handleDisclosureKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      const focusableItems = getFocusableItems();
      const activeIndex = focusableItems.indexOf(
        targetWindow?.document.activeElement as HTMLAnchorElement,
      );
      const shouldReturnToTrigger = event.shiftKey
        ? activeIndex === 0
        : activeIndex === focusableItems.length - 1;

      if (shouldReturnToTrigger) {
        event.preventDefault();
        setOpen(false);
        focusTrigger();
      }

      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      focusItemByOffset(1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      focusItemByOffset(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem("last");
    }
  };

  const handleDisclosureBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (
      nextFocusedElement &&
      (event.currentTarget.contains(nextFocusedElement) ||
        triggerRef.current?.contains(nextFocusedElement))
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Button
        aria-controls={disclosureId}
        aria-expanded={open}
        aria-label="Show breadcrumb levels"
        appearance="transparent"
        className={clsx(withBaseName("collapseButton"), {
          [withBaseName("collapseButton-active")]: open,
        })}
        ref={handleTriggerRef}
        {...getReferenceProps({
          onBlur: handleTriggerBlur,
          onKeyDown: handleTriggerKeyDown,
        })}
      >
        <OverflowMenuIcon aria-hidden />
      </Button>
      <FloatingComponent
        className={withBaseName("disclosure")}
        focusManagerProps={
          context
            ? {
                closeOnFocusOut: true,
                context,
                initialFocus: -1,
                modal: false,
                returnFocus: false,
              }
            : undefined
        }
        height={elements.floating?.offsetHeight}
        left={x ?? 0}
        open={open}
        position={strategy}
        ref={refs.setFloating}
        top={y ?? 0}
        width={elements.floating?.offsetWidth}
        {...getFloatingProps({
          id: disclosureId,
          onBlur: handleDisclosureBlur,
          onKeyDown: handleDisclosureKeyDown,
        })}
      >
        <ol
          aria-label="Hidden breadcrumb levels"
          className={withBaseName("disclosureList")}
        >
          {items.map((item, index) => (
            <BreadcrumbNextContext.Provider
              key={item.key}
              value={{
                current: item.index === currentIndex,
                onNavigate: () => setOpen(false),
                placement: "disclosure",
                render,
                showSeparator: false,
                triggerRef: (element) => {
                  if (element?.tagName === "A") {
                    itemElements.current.set(
                      index,
                      element as HTMLAnchorElement,
                    );
                  } else {
                    itemElements.current.delete(index);
                  }
                },
              }}
            >
              {item.element}
            </BreadcrumbNextContext.Provider>
          ))}
        </ol>
      </FloatingComponent>
    </>
  );
}
