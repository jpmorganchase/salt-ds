import type { FloatingContext } from "@floating-ui/react";
import { useInteractions, useListNavigation } from "@floating-ui/react";
import { useMemo } from "react";

interface UseMegaMenuListNavigationProps {
  context: FloatingContext;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  activeIndex: number | null;
  onNavigate: (index: number | null) => void;
  isEnabled: boolean;
}

/**
 * Hook for mega menu list navigation using Floating UI.
 * Extends useListNavigation with mega menu specific behavior:
 * - Vertical navigation support
 * - Non-looping behavior (proper boundary handling)
 * - Integration with mega menu focus management
 */
export const useMegaMenuListNavigation = ({
  context,
  elementsRef,
  activeIndex,
  onNavigate,
  isEnabled,
}: UseMegaMenuListNavigationProps) => {
  const { getFloatingProps: getListNavigationFloatingProps } = useInteractions([
    useListNavigation(context, {
      listRef: elementsRef,
      activeIndex,
      onNavigate,
      orientation: "vertical",
      loop: false,
      enabled: isEnabled,
      focusItemOnOpen: false,
    }),
  ]);

  return useMemo(
    () => ({ getListNavigationFloatingProps }),
    [getListNavigationFloatingProps],
  );
};
