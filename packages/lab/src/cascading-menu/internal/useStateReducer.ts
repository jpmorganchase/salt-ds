import { useCallback } from "react";

import { flattenedMenuState, menuState } from "./stateUtils";
import { CascadingMenuAction, menuAction } from "./CascadingMenuAction";

export type stateItem = {
  id: string;
  highlightedItemIndex: number | null;
};

type state = stateItem[];

function getDefaultMenuState(id: string): stateItem {
  return {
    id,
    highlightedItemIndex: null,
  };
}

function deleteAllMenusStartingFromLevel(level: number, menus: stateItem[]) {
  const newState = [...menus];
  newState.splice(level);
  return newState;
}

function menuPositionReducer(state: state, action: menuAction, level: number) {
  const { type } = action;
  switch (type) {
    case CascadingMenuAction.SET_FLIPPED:
      state[level] = {
        ...state[level],
      };
      return state;
    default:
      return state;
  }
}

export function useStateReducer(
  menusDataById: flattenedMenuState = {},
  isNavigatingWithKeyboard: boolean
) {
  return useCallback(
    (state: state, action: menuAction): state => {
      let newState = [...state];
      const { type, targetId, highlightedItemIndex = null } = action;
      const { level, childMenus = [] } = Object(
        menusDataById[targetId]
      ) as menuState;
      const childId =
        typeof highlightedItemIndex === "number"
          ? childMenus[highlightedItemIndex]
          : null;
      const childMenuData = childId ? menusDataById[childId] : undefined;

      newState = menuPositionReducer(newState, action, level);
      switch (type) {
        case CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM:
          newState[level] = {
            ...newState[level],
            highlightedItemIndex,
          };
          newState = deleteAllMenusStartingFromLevel(level + 1, newState);
          if (childId && childMenuData && !isNavigatingWithKeyboard) {
            newState[childMenuData.level] = getDefaultMenuState(childId);
          }
          break;
        case CascadingMenuAction.RESET_MENU:
          newState[level] = {
            ...newState[level],
            highlightedItemIndex: null,
          };
          newState = deleteAllMenusStartingFromLevel(level + 1, newState);
          break;
        case CascadingMenuAction.OPEN_MENU:
          newState[level] = getDefaultMenuState(targetId);
          break;
        case CascadingMenuAction.CLOSE_MENU:
          newState = deleteAllMenusStartingFromLevel(level, newState);
          break;
        case CascadingMenuAction.CLOSE_CASCADING_MENU:
          newState = [];
          break;
        default:
          break;
      }
      return newState;
    },
    [isNavigatingWithKeyboard, menusDataById]
  );
}
