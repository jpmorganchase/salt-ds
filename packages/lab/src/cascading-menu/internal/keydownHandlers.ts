import { stateChangeTypes } from "../stateChangeTypes";
import { CascadingMenuAction } from "./CascadingMenuAction";
import { hasSubMenu, isMenuItem } from "./stateUtils";
import { CascadingMenuListProps } from "../CascadingMenuList";
import { Dispatch, SetStateAction, KeyboardEvent } from "react";

interface getKeyDownHandlersProps extends CascadingMenuListProps {
  keyDownHandlersOverride?: Record<string, (event: Event) => void>;
}

export function getKeyDownHandlers(
  props: getKeyDownHandlersProps,
  setIsMenuActive: Dispatch<SetStateAction<boolean>>
) {
  const {
    keyDownHandlersOverride,
    onItemClick,
    dispatch,
    isNavigatingWithKeyboard,
    setIsNavigatingWithKeyboard,
    data,
    menuTriggerRef,
    highlightedItemIndex,
    menuId,
    parentElement,
    isRoot,
  } = props;

  const rowCount = data.menuItems.length;
  const isIndexDisabled = () =>
    highlightedItemIndex
      ? data.menuItems?.[highlightedItemIndex]?.disabled
      : false;

  const handlers: Record<string, (event: KeyboardEvent<HTMLElement>) => void> =
    {
      Enter(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);

        if (highlightedItemIndex === null || isIndexDisabled()) {
          return;
        }
        // If it is an actionable item -> execute action, close cascading menu and move focus to menu trigger
        const selectedItem = data.menuItems[highlightedItemIndex];
        const subMenuId = data.childMenus[highlightedItemIndex];
        if (isMenuItem(selectedItem)) {
          onItemClick?.(selectedItem, event);

          dispatch({
            type: CascadingMenuAction.CLOSE_CASCADING_MENU,
            cause: stateChangeTypes.ITEM_KEYDOWN_ENTER,
            targetId: menuId,
          });
          if (menuTriggerRef && menuTriggerRef.focus) {
            menuTriggerRef.focus();
          }
        } else if (hasSubMenu(selectedItem)) {
          setIsMenuActive(false);
          dispatch({
            type: CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.ITEM_KEYDOWN_ENTER,
            targetId: subMenuId,
          });
        }
      },
      ArrowRight(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);

        // User is switching from mouse to keyboard interaction
        if (highlightedItemIndex === null && !isNavigatingWithKeyboard) {
          // Move focus to first item in the list
          dispatch({
            type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
            cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_RIGHT,
            targetId: menuId,
            highlightedItemIndex: 0,
          });
          return;
        }

        if (highlightedItemIndex === null || isIndexDisabled()) {
          return;
        }

        const selectedItem = data.menuItems[highlightedItemIndex];
        const subMenuId = data.childMenus[highlightedItemIndex];
        if (hasSubMenu(selectedItem)) {
          setIsMenuActive(false);
          dispatch({
            type: CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_RIGHT,
            targetId: subMenuId,
          });
        }
      },
      " ": (event: KeyboardEvent<HTMLElement>) => {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);

        if (highlightedItemIndex === null || isIndexDisabled()) {
          return;
        }

        const selectedItem = data.menuItems[highlightedItemIndex];
        const subMenuId = data.childMenus[highlightedItemIndex];
        if (isMenuItem(selectedItem)) {
          onItemClick?.(selectedItem, event);
        } else if (hasSubMenu(selectedItem)) {
          setIsMenuActive(false);
          dispatch({
            type: CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.ITEM_KEYDOWN_SPACEBAR,
            targetId: subMenuId,
          });
        }
      },
      Tab() {
        // On tab close the cascading menu and focus the menu trigger so that focus event bubbling can either select
        // next element in tab order for Tab key or previous one for Tab + Shift key
        setIsNavigatingWithKeyboard(true);
        dispatch({
          type: CascadingMenuAction.CLOSE_CASCADING_MENU,
          cause: stateChangeTypes.ITEM_KEYDOWN_TAB,
          targetId: menuId,
        });
        if (menuTriggerRef && menuTriggerRef.focus) {
          menuTriggerRef.focus();
        }
      },
      ArrowLeft(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        if (parentElement && !isRoot) {
          parentElement.focus();
          dispatch({
            type: CascadingMenuAction.CLOSE_MENU,
            cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_LEFT,
            targetId: menuId,
          });
        }
      },
      Escape(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        dispatch({
          type: CascadingMenuAction.CLOSE_MENU,
          cause: stateChangeTypes.ITEM_KEYDOWN_ESCAPE,
          targetId: menuId,
        });

        if (parentElement) {
          parentElement.focus();
        }
      },
      ArrowDown(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        let indexAfterMovement =
          highlightedItemIndex === null ? 0 : highlightedItemIndex + 1;
        indexAfterMovement =
          indexAfterMovement > rowCount - 1 ? 0 : indexAfterMovement;

        // Move to next item or first item if at the end of the list
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_DOWN,
          targetId: menuId,
          highlightedItemIndex: indexAfterMovement,
        });
      },
      ArrowUp(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        let indexAfterMovement =
          highlightedItemIndex === null
            ? rowCount - 1
            : highlightedItemIndex - 1;
        indexAfterMovement =
          indexAfterMovement < 0 ? rowCount - 1 : indexAfterMovement;

        // Move to previous item or last item if at the start of the list
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_UP,
          targetId: menuId,
          highlightedItemIndex: indexAfterMovement,
        });
      },
      Home(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        if (highlightedItemIndex === 0) {
          return;
        }

        // Move focus to first item in the list
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.ITEM_KEYDOWN_HOME,
          targetId: menuId,
          highlightedItemIndex: 0,
        });
      },

      End(event: KeyboardEvent<HTMLElement>) {
        event.preventDefault();
        setIsNavigatingWithKeyboard(true);
        if (highlightedItemIndex === rowCount - 1) {
          return;
        }

        // Move focus to last item in the list
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.ITEM_KEYDOWN_ESCAPE,
          targetId: menuId,
          highlightedItemIndex: rowCount - 1,
        });
      },
      ...keyDownHandlersOverride,
    };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    handlers[event.key]?.(event);
  };

  return handleKeyDown;
}
