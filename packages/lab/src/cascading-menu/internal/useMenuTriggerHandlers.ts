import {
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useEventCallback } from "../../utils";
import type { CascadingMenuProps } from "../CascadingMenuProps";
import { stateChangeTypes } from "../stateChangeTypes";
import { CascadingMenuAction } from "./CascadingMenuAction";
import type { menuState } from "./stateUtils";
import type { stateItem } from "./useStateReducer";

interface useMenuTriggerHandlersProps {
  dispatch: (action: any) => void;
  children: CascadingMenuProps["children"];
  setIsNavigatingWithKeyboard: (value: boolean) => void;
  openCloseMenu: (open: boolean) => void;
  rootMenuState: stateItem;
  rootMenuId: string | undefined;
  menusDataById: Record<string, menuState>;
}

export function useMenuTriggerHandlers({
  dispatch,
  children,
  setIsNavigatingWithKeyboard,
  openCloseMenu,
  rootMenuState,
  rootMenuId,
  menusDataById = {},
}: useMenuTriggerHandlersProps) {
  const handleOnClick = useEventCallback((event: MouseEvent<HTMLElement>) => {
    const { type } = event;

    setIsNavigatingWithKeyboard(false);
    if (type === "click") {
      if (isValidElement(children)) {
        const childrenProps = children.props as HTMLAttributes<HTMLElement>;
        childrenProps.onClick?.(event);
      }
      openCloseMenu(!rootMenuState);
    }
  });

  const handleOnKeydown = useEventCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { key } = event;

      switch (key) {
        case "Spacebar":
        case " ":
        case "Enter":
          event.stopPropagation();
          event.preventDefault();
          setIsNavigatingWithKeyboard(true);
          dispatch({
            type: rootMenuState
              ? CascadingMenuAction.CLOSE_MENU
              : CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.KEYBOARD_TOGGLE,
            targetId: rootMenuId,
          });
          break;
        case "ArrowDown":
          event.stopPropagation();
          event.preventDefault();
          setIsNavigatingWithKeyboard(true);
          if (rootMenuState) {
            break;
          }
          dispatch({
            type: CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.KEYBOARD_TOGGLE,
            targetId: rootMenuId,
          });
          break;
        case "ArrowUp":
          event.stopPropagation();
          event.preventDefault();
          setIsNavigatingWithKeyboard(true);
          if (rootMenuState || !rootMenuId) {
            break;
          }
          dispatch({
            type: CascadingMenuAction.OPEN_MENU,
            cause: stateChangeTypes.KEYBOARD_TOGGLE,
            targetId: rootMenuId,
          });
          dispatch({
            type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
            cause: stateChangeTypes.ITEM_KEYDOWN_ARROW_UP,
            targetId: rootMenuId,
            highlightedItemIndex:
              menusDataById[rootMenuId].menuItems.length - 1,
          });
          break;
        default:
          break;
      }

      if (isValidElement(children)) {
        const childrenProps = children.props as HTMLAttributes<HTMLElement>;
        childrenProps.onKeyDown?.(event);
      }
    },
  );

  return [handleOnClick, handleOnKeydown] as const;
}
