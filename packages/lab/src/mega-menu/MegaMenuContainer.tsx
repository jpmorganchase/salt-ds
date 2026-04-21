import {
  flip,
  limitShift,
  shift,
  size,
  useInteractions,
  useListNavigation,
} from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import megaMenuContainerCss from "./MegaMenuContainer.css";
import { MegaMenuContext } from "./MegaMenuContext";

const withBaseName = makePrefixer("saltMegaMenuContainer");
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const REGION_SELECTOR =
  '.saltMegaMenuGroup, [data-salt-mega-menu-region="true"]';

const getFocusableElements = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

const getReferenceFocusable = (
  reference: HTMLElement | null,
): HTMLElement | null =>
  reference?.querySelector<HTMLElement>("a, button, [tabindex]") ?? reference;

export interface MegaMenuContainerProps extends HTMLAttributes<HTMLElement> {
  /**
   * The content of the mega menu container, typically MegaMenuHeader, MegaMenuGroup, and MegaMenuItem components.
   */
  children?: ReactNode;
}

export const MegaMenuContainer = forwardRef<
  HTMLElement,
  MegaMenuContainerProps
>(function MegaMenuContainer({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-container",
    css: megaMenuContainerCss,
    window: targetWindow,
  });

  const { Component: FloatingComponent } = useFloatingComponent();
  const megaMenu = useContext(MegaMenuContext);

  if (!megaMenu) {
    throw new Error("MegaMenuContainer must be used within a MegaMenu");
  }

  const floatingUIResult = useFloatingUI({
    rootContext: megaMenu.floatingRootContext,
    placement: megaMenu.placement,
    middleware: [
      flip(),
      shift({ limiter: limitShift() }),
      size({
        apply({ availableWidth, elements }) {
          elements.floating.style.setProperty(
            "--saltMegaMenuContainer-availableWidth",
            `${availableWidth}px`,
          );
        },
      }),
    ],
  });

  const handleRef = useForkRef<HTMLElement>(ref, megaMenu.setFloating);

  const isOpen = megaMenu.openState;
  const floatingProps = megaMenu.getFloatingProps;
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { getFloatingProps: getListNavigationFloatingProps } = useInteractions([
    useListNavigation(floatingUIResult.context, {
      listRef: elementsRef,
      activeIndex,
      onNavigate: setActiveIndex,
      orientation: "vertical",
      loop: false,
      enabled: isOpen,
      focusItemOnOpen: false,
    }),
  ]);

  useEffect(() => {
    if (!isOpen) {
      elementsRef.current = [];
      setActiveIndex(null);
      return;
    }

    const floating = megaMenu.floatingRootContext.elements
      .floating as HTMLElement | null;
    if (!floating) return;

    const items = getFocusableElements(floating);
    elementsRef.current = items;

    const activeElement = floating.ownerDocument
      .activeElement as HTMLElement | null;
    setActiveIndex(activeElement ? items.indexOf(activeElement) : null);
  }, [isOpen, megaMenu]);

  const focusReference = useCallback(() => {
    const reference = megaMenu.floatingRootContext.elements
      .reference as HTMLElement | null;
    getReferenceFocusable(reference)?.focus();
  }, [megaMenu]);

  const closeAndFocusNextAfterReference = useCallback(
    (container: HTMLElement) => {
      const reference = megaMenu.floatingRootContext.elements
        .reference as HTMLElement | null;
      const referenceFocusable = getReferenceFocusable(reference);

      const nextFromSibling = referenceFocusable
        ?.closest("li")
        ?.nextElementSibling?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

      const nextOutsideMenu =
        nextFromSibling ||
        (() => {
          const outsideFocusable = getFocusableElements(
            container.ownerDocument,
          ).filter((el) => !container.contains(el));
          const index = referenceFocusable
            ? outsideFocusable.indexOf(referenceFocusable)
            : -1;
          return index >= 0 ? outsideFocusable[index + 1] : undefined;
        })();

      megaMenu.setOpen(false);

      if (nextOutsideMenu) {
        const view = container.ownerDocument.defaultView;
        view?.requestAnimationFrame(() => {
          view?.requestAnimationFrame(() => {
            nextOutsideMenu.focus();
          });
        });
      }
    },
    [megaMenu],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const isArrowUp = event.key === "ArrowUp";
      const isArrowDown = event.key === "ArrowDown";
      const isArrowLeft = event.key === "ArrowLeft";
      const isArrowRight = event.key === "ArrowRight";
      const isForwardTab = event.key === "Tab" && !event.shiftKey;
      const isBackwardTab = event.key === "Tab" && event.shiftKey;

      const target = event.target as HTMLElement;
      const container = event.currentTarget;

      if (isArrowUp || isArrowDown || isArrowLeft || isArrowRight) {
        const focusedItem = target.closest(
          FOCUSABLE_SELECTOR,
        ) as HTMLElement | null;
        if (!focusedItem) return;

        const items = elementsRef.current.filter(
          (item): item is HTMLElement => item != null,
        );
        const focusedItemIndex = items.indexOf(focusedItem);
        if (focusedItemIndex === -1) return;

        const isFirstItem = focusedItemIndex === 0;
        const isLastItem = focusedItemIndex === items.length - 1;

        if (isArrowUp) {
          // Up on first item keeps prior behavior by moving focus to trigger.
          if (isFirstItem) {
            event.preventDefault();
            focusReference();
          }
          return;
        }

        if (isArrowDown) {
          // Vertical movement is handled by useListNavigation.
          return;
        }

        // Left on first item: focus trigger and keep menu open.
        if (isArrowLeft && isFirstItem) {
          event.preventDefault();
          focusReference();
          return;
        }

        // Right on last item: focus trigger and collapse menu.
        if (isArrowRight && isLastItem) {
          event.preventDefault();
          focusReference();
          megaMenu.setOpen(false);
          return;
        }

        const regions = Array.from(
          container.querySelectorAll<HTMLElement>(REGION_SELECTOR),
        );
        const regionItems = regions
          .map((region) => getFocusableElements(region))
          .filter((items) => items.length > 0);

        const flatItems = regionItems.flat();
        const flatIndex = flatItems.indexOf(focusedItem);
        if (flatIndex === -1) return;

        const currentRegionIndex = regionItems.findIndex((items) =>
          items.includes(focusedItem),
        );
        if (currentRegionIndex === -1) return;

        const currentItems = regionItems[currentRegionIndex];
        const itemIndex = currentItems.indexOf(focusedItem);

        if (isArrowLeft) {
          const previousRegion = regionItems[currentRegionIndex - 1];
          if (previousRegion && previousRegion.length > 0) {
            event.preventDefault();
            previousRegion[0]?.focus();
          }
          return;
        }

        if (isArrowRight) {
          const nextRegion = regionItems[currentRegionIndex + 1];
          if (nextRegion && nextRegion.length > 0) {
            event.preventDefault();
            nextRegion[0]?.focus();
          }
          return;
        }
      }

      const dir = isBackwardTab ? -1 : isForwardTab ? 1 : 0;
      if (!dir) return;

      const allFocusable = getFocusableElements(container);
      const focusTarget = target.closest(
        FOCUSABLE_SELECTOR,
      ) as HTMLElement | null;
      const i = focusTarget ? allFocusable.indexOf(focusTarget) : -1;
      if (i === -1) return;

      // First item + backward: focus trigger
      if (dir === -1 && i === 0) {
        event.preventDefault();
        focusReference();
        return;
      }

      // Last item + forward: close and move to the next page interactive element.
      // Arrow Down/Right keeps existing behavior (focus trigger + close).
      if (dir === 1 && i === allFocusable.length - 1) {
        event.preventDefault();
        if (isForwardTab) {
          closeAndFocusNextAfterReference(container);
          return;
        }

        focusReference();
        megaMenu.setOpen(false);
        return;
      }

      // Move to next/prev focusable
      event.preventDefault();
      allFocusable[i + dir]?.focus();
    },
    [closeAndFocusNextAfterReference, focusReference, megaMenu],
  );

  return (
    <FloatingComponent
      open={isOpen}
      focusManagerProps={{
        context: floatingUIResult.context,
        modal: false,
        initialFocus: -1,
        returnFocus: false,
        closeOnFocusOut: false,
        guards: false,
      }}
    >
      <nav
        className={clsx(withBaseName(), className)}
        ref={handleRef}
        role="region"
        {...getListNavigationFloatingProps(
          floatingProps({
            ...rest,
            onKeyDown: handleKeyDown,
            style: {
              ...rest.style,
              position: floatingUIResult.strategy,
              top: floatingUIResult.y ?? 0,
              left: floatingUIResult.x ?? 0,
            },
          }),
        )}
      >
        {children}
      </nav>
    </FloatingComponent>
  );
});
