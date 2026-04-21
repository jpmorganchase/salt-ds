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
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
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

const getRegionItems = (container: HTMLElement): HTMLElement[][] =>
  Array.from(container.querySelectorAll<HTMLElement>(REGION_SELECTOR))
    .map((region) => getFocusableElements(region))
    .filter((items) => items.length > 0);

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

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      elementsRef.current = [];
      setActiveIndex(null);
      return;
    }

    const floating = megaMenu.floatingRootContext.elements
      .floating as HTMLElement | null;
    if (!floating) return;

    elementsRef.current = getFocusableElements(floating);
  }, [isOpen, megaMenu]);

  const focusReference = useCallback(() => {
    const reference = megaMenu.floatingRootContext.elements
      .reference as HTMLElement | null;
    getReferenceFocusable(reference)?.focus();
  }, [megaMenu]);

  const handleFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    const index = elementsRef.current.indexOf(event.target as HTMLElement);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, []);

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
      const target = event.target as HTMLElement;
      const container = event.currentTarget;
      const focusedItem = target.closest(
        FOCUSABLE_SELECTOR,
      ) as HTMLElement | null;

      const items = elementsRef.current.filter(
        (item): item is HTMLElement => item != null,
      );
      const focusedItemIndex = focusedItem ? items.indexOf(focusedItem) : -1;
      const isFirstItem = focusedItemIndex === 0;
      const isLastItem = focusedItemIndex === items.length - 1;

      switch (event.key) {
        case "ArrowUp":
          if (focusedItemIndex === -1) return;
          // First item: move focus back to trigger
          if (isFirstItem) {
            event.preventDefault();
            focusReference();
          }
          // Non-first items: useListNavigation handles it
          return;

        case "ArrowDown":
          // useListNavigation handles navigation; preventDefault avoids scroll at boundary
          event.preventDefault();
          return;

        case "ArrowLeft": {
          if (focusedItemIndex === -1) return;
          event.preventDefault();
          if (isFirstItem) {
            focusReference();
            return;
          }
          const regions = getRegionItems(container);
          const regionIndex = regions.findIndex((r) =>
            r.includes(focusedItem!),
          );
          regions[regionIndex - 1]?.[0]?.focus();
          return;
        }

        case "ArrowRight": {
          if (focusedItemIndex === -1) return;
          event.preventDefault();
          if (isLastItem) {
            focusReference();
            megaMenu.setOpen(false);
            return;
          }
          const regions = getRegionItems(container);
          const regionIndex = regions.findIndex((r) =>
            r.includes(focusedItem!),
          );
          regions[regionIndex + 1]?.[0]?.focus();
          return;
        }

        case "Tab": {
          if (focusedItemIndex === -1) return;
          event.preventDefault();
          const dir = event.shiftKey ? -1 : 1;
          if (dir === -1 && isFirstItem) {
            focusReference();
          } else if (dir === 1 && isLastItem) {
            closeAndFocusNextAfterReference(container);
          } else {
            items[focusedItemIndex + dir]?.focus();
          }
          return;
        }

        default:
          return;
      }
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
            onFocus: handleFocus,
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
