import {
  FloatingNode,
  flip,
  limitShift,
  offset,
  type ReferenceType,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type UseFloatingUIProps,
  useControlled,
  useFloatingUI,
  useIsomorphicLayoutEffect,
} from "../utils";
import { MenuContext } from "./MenuContext";

export interface MenuBaseProps {
  children?: ReactNode;
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * If true, the menu will be open by default.
   */
  defaultOpen?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Set the placement of the Menu component relative to the trigger element. Defaults to `bottom-start` if it's the root menu or `right-start` if it's nested.
   */
  placement?: UseFloatingUIProps["placement"];
  /**
   * Function that returns a [virtual element](https://floating-ui.com/docs/virtual-elements). If this is provided, it will override MenuTrigger.
   */
  getVirtualElement?: () => ReferenceType | null;
}

export function MenuBase(props: MenuBaseProps) {
  const {
    children,
    defaultOpen,
    open,
    onOpenChange,
    placement,
    getVirtualElement,
  } = props;
  const parentId = useFloatingParentNodeId();
  const nodeId = useFloatingNodeId();
  const tree = useFloatingTree();
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: Boolean(defaultOpen),
    name: "ListControl",
    state: "open",
  });

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [focusInside, setFocusInside] = useState(false);
  const [triggerDisabled, setTriggerDisabled] = useState(false);

  const isNested = parentId != null;

  const { x, y, strategy, elements, refs, context } = useFloatingUI({
    nodeId,
    open: openState,
    onOpenChange: setOpen,
    strategy: !getVirtualElement ? "absolute" : "fixed",
    placement:
      placement ??
      (isNested || getVirtualElement ? "right-start" : "bottom-start"),
    middleware: [
      // Align the nested menu by shifting it by var(--salt-spacing-fixed-100)
      offset(
        isNested ? { crossAxis: -1, mainAxis: 2 } : !getVirtualElement ? 1 : 0,
      ),
      flip({}),
      shift({ limiter: limitShift() }),
      size({
        apply({ elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  useIsomorphicLayoutEffect(() => {
    if (getVirtualElement) {
      refs.setPositionReference(getVirtualElement());
    }
  }, [getVirtualElement, refs]);

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useHover(context, {
        enabled: isNested && !focusInside && !triggerDisabled,
        handleClose: safePolygon({ blockPointerEvents: true }),
      }),
      useClick(context, {
        event: "mousedown",
        toggle: !isNested,
        ignoreMouse: isNested,
      }),
      useRole(context, { role: "menu" }),
      useDismiss(context, { bubbles: true }),
      useListNavigation(context, {
        listRef: elementsRef,
        activeIndex,
        nested: isNested,
        onNavigate: setActiveIndex,
      }),
    ],
  );

  const getPanelPosition = () => ({
    top: y ?? 0,
    left: x ?? 0,
    position: strategy,
    width: elements.floating?.offsetWidth,
    height: elements.floating?.offsetHeight,
  });

  useEffect(() => {
    if (!tree) return;

    function handleItemClick() {
      setOpen(false);
    }

    tree.events.on("click", handleItemClick);

    return () => {
      tree.events.off("click", handleItemClick);
    };
  }, [tree, setOpen]);

  return (
    <FloatingNode id={nodeId}>
      <MenuContext.Provider
        value={{
          openState,
          getReferenceProps,
          getFloatingProps,
          refs,
          getPanelPosition,
          getItemProps,
          activeIndex,
          context,
          elementsRef,
          focusInside,
          setFocusInside,
          isNested,
          triggerDisabled,
          setTriggerDisabled,
        }}
      >
        {children}
      </MenuContext.Provider>
    </FloatingNode>
  );
}
