import { useCallback, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseMegaMenuFocusManagementProps {
  reference: HTMLElement | null;
  floating: HTMLElement | null;
}

/**
 * Hook for mega menu focus management.
 * Handles focus operations such as:
 * - Finding focusable elements in reference and floating elements
 * - Focusing first focusable item in menu
 * - Returning focus to reference trigger
 */
export const useMegaMenuFocusManagement = ({
  reference,
  floating,
}: UseMegaMenuFocusManagementProps) => {
  const focusRetryCountRef = useRef(0);

  const getReferenceFocusable = useCallback(
    (ref: HTMLElement | null): HTMLElement | null =>
      ref?.querySelector<HTMLElement>("a, button, [tabindex]") ?? ref,
    [],
  );

  const focusFirstFocusableInMenu = useCallback(
    (elementsRef: React.MutableRefObject<Array<HTMLElement | null>>) => {
      const focusFirstFocusable = (attempt = 0) => {
        const items = elementsRef.current.filter(
          (item): item is HTMLElement => item != null,
        );
        const firstFocusable =
          items[0] ?? floating?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

        if (firstFocusable) {
          firstFocusable.focus();
          focusRetryCountRef.current = 0;
          return;
        }

        const view = floating?.ownerDocument.defaultView;
        if (!view || attempt >= 6) {
          focusRetryCountRef.current = 0;
          return;
        }

        focusRetryCountRef.current = attempt + 1;
        view.requestAnimationFrame(() => {
          focusFirstFocusable(attempt + 1);
        });
      };

      focusFirstFocusable();
    },
    [floating],
  );

  const focusReference = useCallback(() => {
    const focusable = getReferenceFocusable(reference);
    setTimeout(() => focusable?.focus(), 0);
  }, [reference, getReferenceFocusable]);

  const closeAndFocusNextAfterReference = useCallback(
    (container: HTMLElement, setOpen: (open: boolean) => void) => {
      const referenceFocusable = getReferenceFocusable(reference);

      const getFocusableElements = (root: ParentNode): HTMLElement[] =>
        Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

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

      setOpen(false);

      if (nextOutsideMenu) {
        const view = container.ownerDocument.defaultView;
        view?.requestAnimationFrame(() => {
          view?.requestAnimationFrame(() => {
            nextOutsideMenu.focus();
          });
        });
      }
    },
    [reference, getReferenceFocusable],
  );

  return {
    getReferenceFocusable,
    focusFirstFocusableInMenu,
    focusReference,
    closeAndFocusNextAfterReference,
  };
};
