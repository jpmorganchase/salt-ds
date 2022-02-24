import { KeyboardEvent, MouseEvent, useCallback } from "react";

import { MenuState } from "../overflow-panel/OverflowPanelProps";

type clickHandler = (event: MouseEvent<HTMLElement>) => void;
type keyDownHandler = (
  event: KeyboardEvent<HTMLElement>,
  closeOnClick?: boolean
) => void;

type menuTriggerHandlersHook = (props: {
  children: React.ReactElement;
  setIsNavigatingWithKeyboard: (isNavigatingWithKeyboard: boolean) => void;
  closeMenu: () => void;
  openMenu: () => void;
  openCloseMenu: (isOpen: boolean) => void;
  handleKeyDown?: (evt: KeyboardEvent<HTMLElement>) => void;
  menuState: MenuState | null;
}) => [clickHandler, keyDownHandler];
const useMenuTriggerHandlers: menuTriggerHandlersHook = ({
  closeMenu,
  openMenu,
  children,
  setIsNavigatingWithKeyboard,
  openCloseMenu,
  handleKeyDown,
  menuState,
}) => {
  const handleOnClick = useCallback<clickHandler>(
    (event: MouseEvent<HTMLElement>) => {
      const childrenProps = children.props;
      const { type } = event;

      setIsNavigatingWithKeyboard(false);
      if (type === "click") {
        if (childrenProps.onClick) {
          childrenProps.onClick(event);
        }

        openCloseMenu(!menuState);
      }
    },
    [children.props, openCloseMenu, menuState, setIsNavigatingWithKeyboard]
  );

  const handleOnKeydown = useCallback<keyDownHandler>(
    // eslint-disable-next-line complexity
    (event: KeyboardEvent<HTMLElement>, closeOnClick: boolean | undefined) => {
      const eventTarget = event.target as HTMLElement;
      const expanded = eventTarget.getAttribute("aria-expanded") === "true";
      const childrenProps = children.props;
      const { key } = event;
      switch (key) {
        case "Enter":
        case " ":
          event.stopPropagation();
          event.preventDefault();
          setIsNavigatingWithKeyboard(true);
          if (closeOnClick !== false) {
            if (menuState) {
              closeMenu();
            } else {
              openMenu();
            }
            handleKeyDown && handleKeyDown(event);
          }
          break;
        case "Escape":
          event.stopPropagation();
          event.preventDefault();
          setIsNavigatingWithKeyboard(true);
          if (closeOnClick !== false || !expanded) {
            closeMenu();
            handleKeyDown && handleKeyDown(event);
          }
          break;
        default:
          handleKeyDown && handleKeyDown(event);
      }

      if (childrenProps.onKeyDown) {
        childrenProps.onKeyDown(event);
      }
    },
    [
      closeMenu,
      children.props,
      handleKeyDown,
      menuState,
      openMenu,
      setIsNavigatingWithKeyboard,
    ]
  );

  return [handleOnClick, handleOnKeydown];
};

export default useMenuTriggerHandlers;
