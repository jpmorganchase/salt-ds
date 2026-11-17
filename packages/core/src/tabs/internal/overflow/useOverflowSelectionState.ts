import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useIsomorphicLayoutEffect, usePrevious } from "../../../utils";

interface PendingOverflowSelection {
  event: SyntheticEvent | null;
  value: string;
}

interface UseOverflowSelectionStateArgs {
  commitSelection: (event: SyntheticEvent | null, value: string) => void;
  menuOpen: boolean;
  selected?: string;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

interface UseOverflowSelectionStateResult {
  selectionFromOverflowValueRef: MutableRefObject<string | null>;
  setSelected: (
    event: SyntheticEvent | null,
    value: string,
    source?: "main" | "overflow" | "removal",
  ) => void;
}

export function useOverflowSelectionState({
  commitSelection,
  menuOpen,
  selected,
  setMenuOpen,
}: UseOverflowSelectionStateArgs): UseOverflowSelectionStateResult {
  const previousSelected = usePrevious(selected, [selected]);
  const selectionFromOverflowValueRef = useRef<string | null>(null);
  const pendingOverflowSelectionRef = useRef<PendingOverflowSelection | null>(
    null,
  );

  const setSelected = useCallback(
    (
      event: SyntheticEvent | null,
      value: string,
      source: "main" | "overflow" | "removal" = "main",
    ) => {
      const selectedFromOverflow = source === "overflow";
      selectionFromOverflowValueRef.current = selectedFromOverflow
        ? value
        : null;

      if (selectedFromOverflow) {
        event?.persist();
        pendingOverflowSelectionRef.current = { event, value };
        setMenuOpen(false);
        return;
      }

      pendingOverflowSelectionRef.current = null;
      // Replacing a removed selected tab leaves an open overflow menu, and
      // the focus inside it, alone.
      if (source !== "removal") {
        setMenuOpen(false);
      }
      commitSelection(event, value);
    },
    [commitSelection, setMenuOpen],
  );

  useIsomorphicLayoutEffect(() => {
    if (menuOpen) {
      return;
    }

    const pendingSelection = pendingOverflowSelectionRef.current;
    if (!pendingSelection) {
      return;
    }

    pendingOverflowSelectionRef.current = null;
    commitSelection(pendingSelection.event, pendingSelection.value);
  }, [commitSelection, menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      return;
    }

    const selectedFromOverflow = selectionFromOverflowValueRef.current;
    if (selectedFromOverflow == null || pendingOverflowSelectionRef.current) {
      return;
    }

    if (selected === selectedFromOverflow && selected !== previousSelected) {
      return;
    }

    const clearStaleSelection = setTimeout(() => {
      if (selectionFromOverflowValueRef.current === selectedFromOverflow) {
        selectionFromOverflowValueRef.current = null;
      }
    });

    return () => clearTimeout(clearStaleSelection);
  }, [menuOpen, previousSelected, selected]);

  return {
    selectionFromOverflowValueRef,
    setSelected,
  };
}
