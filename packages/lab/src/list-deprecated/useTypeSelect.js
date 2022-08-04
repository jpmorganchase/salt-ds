import { useCallback, useRef } from "react";
import { escapeRegExp } from "../utils";

import { itemToString as defaultItemToString } from "./itemToString";

const TYPE_SELECT_TIMEOUT = 1500;

export function useTypeSelect(options) {
  const {
    getItemAtIndex,
    highlightedIndex,
    itemCount,
    itemToString = defaultItemToString,
    onTypeSelect,
    setFocusVisible,
    setHighlightedIndex,
  } = options;

  const getItemIndexForSearch = useCallback(
    (searchTerm, fromIndex) => {
      if (itemCount === 0) {
        return null;
      }

      let index = fromIndex || 0;
      while (index < itemCount) {
        const item = getItemAtIndex(index);
        const textValue = itemToString ? itemToString(item) : item;
        if (
          textValue &&
          textValue.match(new RegExp(`^${escapeRegExp(searchTerm)}`, "i"))
        ) {
          return index;
        }

        index = index + 1;
      }

      return null;
    },
    [itemCount, itemToString, getItemAtIndex]
  );

  const state = useRef({
    search: "",
    timeout: null,
  }).current;

  // eslint-disable-next-line complexity
  const onKeyDownCapture = (event) => {
    const character = getStringForKey(event.key);
    if (!character || event.ctrlKey || event.metaKey) {
      return;
    }

    // Do not propagate the Spacebar event if it's meant to be part of the search.
    // When we time out, the search term becomes empty, hence the check on length.
    // Trimming is to account for the case of pressing the Spacebar more than once,
    // which should cycle through the selection/deselection of the focused item.
    if (character !== " " || state.search.trim().length > 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    // When typing same character sebsequently and *quickly*, we treat it as cyling through items
    // starting with that char instead of seaching for double character, because in most cases
    // there won't be any option having same characters at the beginning. This should be only
    // impacting beginning of the words because length of `character` would be 1.
    if (character !== state.search) {
      state.search += character;
    }

    // Prioritize items after the currently focused item, falling back to searching the whole list.
    // We want to cycle through choices when keep typing the same first character, hence the +1
    // condition. All subsequent characters should stay at the current item otherwise it will
    // always jumping around.
    let index = getItemIndexForSearch(
      state.search,
      state.search.length > 1 ? highlightedIndex : highlightedIndex + 1
    );

    // If no key found, search from the top.
    if (index == null) {
      index = getItemIndexForSearch(state.search);
    }

    if (index != null) {
      setFocusVisible(true);
      // TODO: Maybe we can repurpose this setHighlightedIndex so that the user controls it's meant to set
      // hightlighted index when expanded v.s. selected item when collapsed
      setHighlightedIndex(index);
      if (onTypeSelect) {
        onTypeSelect(index);
      }
    }

    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = "";
    }, TYPE_SELECT_TIMEOUT);
  };

  return {
    // Using a capturing listener to catch the keydown event before
    // other hooks in order to handle the Spacebar event.
    onKeyDownCapture,
  };
}

function getStringForKey(key) {
  // If the key is of length 1, it is an ASCII value.
  // Otherwise, if there are no ASCII characters in the key name,
  // it is a Unicode character.
  // See https://www.w3.org/TR/uievents-key/
  if (key.length === 1 || !/^[A-Z]/i.test(key)) {
    return key;
  }

  return "";
}
