import { type KeyboardEvent, useCallback, useRef } from "react";
import type { CollectionItem } from "./collectionTypes";
import { isCharacterKey, Space } from "./keyUtils";

interface TypeaheadHookProps<Item> {
  disableTypeToSelect?: boolean;
  highlightedIdx: number;
  highlightItemAtIndex: (idx: number) => void;
  applyIncrementalSearch?: boolean;
  typeToNavigate: boolean;
  items: CollectionItem<Item>[];
}

interface TypeaheadHookResult {
  onKeyDown?: (e: KeyboardEvent) => void;
}

export const useTypeahead = <Item>({
  disableTypeToSelect,
  highlightedIdx,
  highlightItemAtIndex,
  typeToNavigate,
  items,
  applyIncrementalSearch = true,
}: TypeaheadHookProps<Item>): TypeaheadHookResult => {
  const keyDownTimer = useRef<number | null>(null);
  const searchChars = useRef("");
  const startIdx = useRef(-1);

  const applySearch = useCallback(
    (intermediateSearch?: true | undefined) => {
      if (intermediateSearch || !applyIncrementalSearch) {
        const regex = new RegExp(`^${searchChars.current}`, "i");
        let idx = items.findIndex(
          ({ label }, i) => i > startIdx.current && label && regex.test(label),
        );
        if (idx === -1) {
          idx = items.findIndex(
            ({ label }, i) =>
              i <= startIdx.current && label && regex.test(label),
          );
        }
        if (idx !== -1) {
          highlightItemAtIndex(idx);
        }
      } else {
        searchChars.current = "";
        keyDownTimer.current = null;
        startIdx.current = -1;
      }
    },
    [applyIncrementalSearch, highlightItemAtIndex, items],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const searchInProgress = startIdx.current !== -1;
      if (isCharacterKey(e) || (searchInProgress && e.key === Space)) {
        if (typeToNavigate) {
          e.preventDefault();
          e.stopPropagation();
          // If we type the same key repeatedly, we cycle through the matches
          if (startIdx.current === -1 || e.key === searchChars.current) {
            startIdx.current = highlightedIdx;
          }
          if (keyDownTimer.current !== null) {
            clearTimeout(keyDownTimer.current);
            keyDownTimer.current = null;
          }
          if (e.key !== searchChars.current) {
            searchChars.current += e.key;
          }
          if (applyIncrementalSearch) {
            applySearch(true);
          }
          // keyDownTimer.current = window.setTimeout(applySearch, 100);
          keyDownTimer.current = window.setTimeout(() => {
            applySearch();
          }, 100);
        }
      }
    },
    [typeToNavigate, applyIncrementalSearch, highlightedIdx, applySearch],
  );

  return {
    onKeyDown: disableTypeToSelect ? undefined : handleKeyDown,
  };
};
