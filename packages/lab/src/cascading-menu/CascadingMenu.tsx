import {
  getRefFromChildren,
  ownerWindow,
  useControlled,
  useDensity,
  useForkRef,
  usePrevious,
} from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useEventCallback } from "../utils";
import { CascadingMenuList } from "./CascadingMenuList";
import type { CascadingMenuProps, MenuDescriptor } from "./CascadingMenuProps";
import { CascadingMenuAction } from "./internal/CascadingMenuAction";
import { defaultGetScreenBounds } from "./internal/menuPositioning";
import { deriveFlatStateFromTree } from "./internal/stateUtils";
import { useClickAway } from "./internal/useClickAway";
import { useMenuTriggerHandlers } from "./internal/useMenuTriggerHandlers";
import { useRefsManager } from "./internal/useRefsManager";
import { useStateReducer } from "./internal/useStateReducer";
import { stateChangeTypes } from "./stateChangeTypes";

const defaultItemToString = (item: any) => item?.title || String(item);

export const CascadingMenu = forwardRef<HTMLDivElement, CascadingMenuProps>(
  function CascadingMenu(props, ref) {
    const {
      children,
      className,
      initialSource: initialSourceProp,
      itemToString = defaultItemToString,
      onClose,
      onItemClick,
      onOpen,
      maxWidth = 544,
      minWidth = 200,
      delay = 300,
      rowHeight,
      tooltipEnterDelay = 1500,
      tooltipLeaveDelay = 0,
      height,
      rootPlacement,
      // Add this to offset x, y on popper open
      rootPlacementOffset,
      menuTriggerRef: anchorRefProp,
      open: openProp,
      getScreenBounds = defaultGetScreenBounds,
      disableMouseOutInteractions,
      disableClickAway,
      containingDocument = globalThis.document,
      source: sourceProp,
    } = props;
    const density = useDensity();

    const refsManager = useRefsManager();
    const childrenRef = useRef<HTMLElement | null>(null);
    const getMenuTriggerRef = useCallback(
      (): HTMLElement | null => anchorRefProp || childrenRef.current,
      [anchorRefProp],
    );

    const [menuSource] = useControlled({
      controlled: sourceProp,
      default: initialSourceProp,
      name: "CascadingMenu",
      state: "source",
    });

    const [isNavigatingWithKeyboard, setIsNavigatingWithKeyboard] =
      useState(false);

    const menusDataById = useMemo(
      () => (menuSource ? deriveFlatStateFromTree(menuSource) : {}),
      [menuSource],
    );

    const rootMenuId = useMemo(
      () =>
        Object.keys(menusDataById).find((id) => menusDataById[id].level === 0),
      [menusDataById],
    );

    const stateReducer = useStateReducer(
      menusDataById,
      isNavigatingWithKeyboard,
    );
    const [state, dispatch] = useReducer(stateReducer, []);
    const rootMenuState = state[0];

    // Call open and close callbacks after rendering as we know for sure whether the cascading menu is open or closed
    const prevState = usePrevious(state, undefined, []);
    const prevRootMenuState = prevState?.[0];
    useEffect(() => {
      if (!!rootMenuState !== !!prevRootMenuState) {
        if (!rootMenuState) {
          onClose?.();
        } else if (rootMenuState) {
          onOpen?.();
        }
      }
    });

    // Controlled opening/closing of the menu
    const openCloseMenu = useCallback(
      (open: boolean) => {
        if (rootMenuId) {
          dispatch({
            type: open
              ? CascadingMenuAction.OPEN_MENU
              : CascadingMenuAction.CLOSE_CASCADING_MENU,
            cause: stateChangeTypes.MOUSE_TOGGLE,
            targetId: rootMenuId,
          });
        }
      },
      [rootMenuId],
    );
    // do not re-render every time if prop does not change
    useEffect(() => {
      if (openProp !== undefined && openProp !== !!rootMenuState) {
        openCloseMenu(openProp);
      }
    });

    const clickAwayNodes = disableClickAway
      ? null
      : () =>
          [getMenuTriggerRef(), ...refsManager.values()].filter(
            (node) => node !== null,
          ) as HTMLElement[];
    useClickAway(
      clickAwayNodes,
      containingDocument,
      () => {
        if (rootMenuId) {
          dispatch({
            type: CascadingMenuAction.CLOSE_CASCADING_MENU,
            cause: stateChangeTypes.CLICKED_AWAY,
            targetId: rootMenuId,
          });
        }
      },
      () => {
        setIsNavigatingWithKeyboard(false);
      },
    );

    const handleResize = useEventCallback(() => {
      if (rootMenuState && rootMenuId) {
        dispatch({
          type: CascadingMenuAction.CLOSE_CASCADING_MENU,
          cause: stateChangeTypes.ON_RESIZE,
          targetId: rootMenuId,
        });
      }
    });

    useEffect(() => {
      const win = ownerWindow(getMenuTriggerRef());

      win.addEventListener("resize", handleResize);
      return () => {
        win.removeEventListener("resize", handleResize);
      };
    }, [getMenuTriggerRef, handleResize]);

    // close the menu on item click via mouse
    const onItemClickCallback = useCallback(
      (sourceItem: MenuDescriptor, event: KeyboardEvent | MouseEvent) => {
        onItemClick?.(sourceItem, event);

        if (!isNavigatingWithKeyboard && rootMenuId) {
          dispatch({
            type: CascadingMenuAction.CLOSE_CASCADING_MENU,
            cause: stateChangeTypes.ITEM_CLICKED,
            targetId: rootMenuId,
          });
        }
      },
      [isNavigatingWithKeyboard, onItemClick, rootMenuId],
    );

    // Set up event handlers on menu trigger if passed
    const setMenuTriggerRef = useCallback((node: HTMLElement) => {
      childrenRef.current = node;
    }, []);
    const handleRef = useForkRef(
      getRefFromChildren(children),
      setMenuTriggerRef,
    );

    const [onMenuTriggerClick, onMenuTriggerKeydown] = useMenuTriggerHandlers({
      dispatch,
      children,
      setIsNavigatingWithKeyboard,
      openCloseMenu,
      rootMenuState,
      rootMenuId,
      menusDataById,
    });

    const cloneMenuChildren = (cloneChildren: ReactNode) => {
      if (isValidElement(cloneChildren)) {
        const childrenProps = {
          ...cloneChildren.props,
        };

        if (openProp === undefined) {
          childrenProps.onClick = onMenuTriggerClick;
          childrenProps.onKeyDown = onMenuTriggerKeydown;
        }

        return cloneElement(cloneChildren, {
          ref: handleRef,
          ...childrenProps,
        });
      }
      return null;
    };

    const clonedChildren = cloneMenuChildren(children);

    const commonMenuProps = {
      className,
      delay,
      itemToString,
      maxWidth,
      minWidth,
      onItemClick: onItemClickCallback,
      dispatch,
      isNavigatingWithKeyboard,
      setIsNavigatingWithKeyboard,
      menusDataById,
      tooltipEnterDelay,
      tooltipLeaveDelay,
      rootPlacement,
      rootPlacementOffset,
      getScreenBounds,
      disableMouseOutInteractions,
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: We want to run this if rootPlacementOffset changes.
    useEffect(() => {
      if (!openProp) {
        setIsNavigatingWithKeyboard(false);
      }
    }, [openProp, rootPlacementOffset]);

    return Object.keys(menusDataById).length > 0 ? (
      <>
        {clonedChildren || null}
        {Object.values(state).map((menuState) => {
          const data = menusDataById[menuState.id];

          const isRoot = data.level === 0;
          const parentElement = isRoot
            ? getMenuTriggerRef()
            : refsManager.get(data?.parentId ?? "");

          const isChildMenuOpen = !!state[data.level + 1];
          return (
            <CascadingMenuList
              {...commonMenuProps}
              data={data}
              height={height}
              highlightedItemIndex={menuState.highlightedItemIndex}
              isChildMenuOpen={isChildMenuOpen}
              isRoot={isRoot}
              key={`${density}${menuState.id}`}
              menuId={menuState.id}
              menuTriggerRef={getMenuTriggerRef()}
              parentElement={parentElement}
              ref={isRoot ? ref : null}
              refsManager={refsManager}
              rowHeight={rowHeight}
            />
          );
        })}
      </>
    ) : null;
  },
);
