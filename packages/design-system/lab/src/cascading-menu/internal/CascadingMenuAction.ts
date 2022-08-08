import { stateChangeCause } from "../stateChangeTypes";

export type menuActionType =
  | "setCurrentInteractedItem"
  | "resetMenu"
  | "openMenu"
  | "closeMenu"
  | "closeCascadingMenu"
  | "setFlipped";

export type menuAction = {
  type: menuActionType;
  cause: stateChangeCause;
  flipped?: boolean;
  highlightedItemIndex?: number;
  targetId: string;
};

export const CascadingMenuAction: Record<string, menuActionType> = {
  SET_CURRENT_INTERACTED_ITEM: "setCurrentInteractedItem",
  RESET_MENU: "resetMenu",
  OPEN_MENU: "openMenu",
  CLOSE_MENU: "closeMenu",
  CLOSE_CASCADING_MENU: "closeCascadingMenu",
  SET_FLIPPED: "setFlipped",
};
