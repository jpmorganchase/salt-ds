export type stateChangeCause =
  | "keyboardToggle"
  | "mouseToggle"
  | "clickedAway"
  | "onResize"
  | "itemClicked"
  | "itemKeydownEnter"
  | "itemKeydownArrowRight"
  | "itemKeydownArrowLeft"
  | "itemKeydownArrowDown"
  | "itemKeydownArrowUp"
  | "itemKeydownSpacebar"
  | "itemKeydownTab"
  | "itemKeydownEscape"
  | "itemKeydownHome"
  | "itemKeydownEnd"
  | "itemMouseEnter"
  | "itemMouseMoveToParent"
  | "mouseOutOfMenus"
  | "keyboardNavAutoFocus";

export const stateChangeTypes: { [key: string]: stateChangeCause } = {
  KEYBOARD_TOGGLE: "keyboardToggle",
  MOUSE_TOGGLE: "mouseToggle",
  CLICKED_AWAY: "clickedAway",
  ON_RESIZE: "onResize",
  ITEM_CLICKED: "itemClicked",
  ITEM_KEYDOWN_ENTER: "itemKeydownEnter",
  ITEM_KEYDOWN_ARROW_RIGHT: "itemKeydownArrowRight",
  ITEM_KEYDOWN_ARROW_LEFT: "itemKeydownArrowLeft",
  ITEM_KEYDOWN_ARROW_DOWN: "itemKeydownArrowDown",
  ITEM_KEYDOWN_ARROW_UP: "itemKeydownArrowUp",
  ITEM_KEYDOWN_SPACEBAR: "itemKeydownSpacebar",
  ITEM_KEYDOWN_TAB: "itemKeydownTab",
  ITEM_KEYDOWN_ESCAPE: "itemKeydownEscape",
  ITEM_KEYDOWN_HOME: "itemKeydownHome",
  ITEM_KEYDOWN_END: "itemKeydownEnd",
  ITEM_MOUSE_ENTER: "itemMouseEnter",
  ITEM_MOUSE_MOVE_TO_PARENT: "itemMouseMoveToParent",
  MOUSE_OUT_OF_MENUS: "mouseOutOfMenus",
  KEYBOARD_NAV_AUTO_FOCUS: "keyboardNavAutoFocus",
};
