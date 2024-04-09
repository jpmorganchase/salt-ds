import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { MenuContext } from "./MenuContext";
import {
  useControlled,
  useFloatingUI,
  UseFloatingUIProps,
} from "@salt-ds/core";
import {
  flip,
  offset,
  shift,
  limitShift,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  useHover,
  safePolygon,
  FloatingNode,
  useFloatingParentNodeId,
  useFloatingNodeId,
  useListNavigation,
  useFloatingTree,
  size,
} from "@floating-ui/react";

export interface MenuBaseProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (newOpen: boolean) => void;
  placement?: UseFloatingUIProps["placement"];
}

export function MenuBase(props: MenuBaseProps) {
  const { children, defaultOpen, open, onOpenChange, placement } = props;
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
    [setOpenState, onOpenChange]
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [focusInside, setFocusInside] = useState(false);

  const isNested = parentId != null;

  const { x, y, strategy, elements, refs, context } = useFloatingUI({
    nodeId,
    open: openState,
    onOpenChange: setOpen,
    placement: placement ?? (isNested ? "right-start" : "bottom-start"),
    middleware: [
      offset(isNested ? { crossAxis: -1 } : {}),
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

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useHover(context, {
        enabled: isNested,
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
    ]
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
        }}
      >
        {children}
      </MenuContext.Provider>
    </FloatingNode>
  );
}
