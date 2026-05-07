import { useIsomorphicLayoutEffect, usePrevious } from "@salt-ds/core";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

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
    source?: "main" | "overflow",
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
      source: "main" | "overflow" = "main",
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
      setMenuOpen(false);
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
    const selectedFromOverflow = selectionFromOverflowValueRef.current;
    if (selectedFromOverflow == null || pendingOverflowSelectionRef.current) {
      return;
    }

    if (selected === selectedFromOverflow && selected !== previousSelected) {
      return;
    }

    selectionFromOverflowValueRef.current = null;
  }, [previousSelected, selected]);

  return {
    selectionFromOverflowValueRef,
    setSelected,
  };
}
