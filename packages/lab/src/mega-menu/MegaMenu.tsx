import {
  type Placement,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useControlled, useId } from "@salt-ds/core";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  MegaMenuContext,
  type MegaMenuCustomInteractions,
} from "./MegaMenuContext";

export interface MegaMenuProps extends MegaMenuCustomInteractions {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedItem?: string;
  defaultSelectedItem?: string;
  onSelectedItemChange?: (selectedItem: string | undefined) => void;
  placement?: Placement;
}

export const MegaMenu = ({
  children,
  open,
  onOpenChange,
  selectedItem: selectedItemProp,
  defaultSelectedItem,
  onSelectedItemChange,
  placement = "bottom",
  interactions,
}: MegaMenuProps) => {
  const menuRegionId = useId();

  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: false,
    name: "MegaMenu",
    state: "open",
  });

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const [requestFocusFirstItemOnOpen, setRequestFocusFirstItemOnOpen] =
    useState(false);
  const [selectedItem, setSelectedItemState] = useControlled({
    controlled: selectedItemProp,
    default: defaultSelectedItem,
    name: "MegaMenu",
    state: "selectedItem",
  });

  const setSelectedItem = useCallback<
    Dispatch<SetStateAction<string | undefined>>
  >(
    (newSelectedItem) => {
      setSelectedItemState((currentSelectedItem) => {
        const nextSelectedItem =
          typeof newSelectedItem === "function"
            ? newSelectedItem(currentSelectedItem)
            : newSelectedItem;

        onSelectedItemChange?.(nextSelectedItem);
        return nextSelectedItem;
      });
    },
    [onSelectedItemChange, setSelectedItemState],
  );

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: setOpen,
    elements: {
      reference,
      floating,
    },
  });

  const defaultInteractions = [
    useRole(floatingRootContext, { role: "menu" }),
    useDismiss(floatingRootContext, { bubbles: true }),
  ];

  const { getReferenceProps, getFloatingProps } = useInteractions(
    interactions ? interactions(floatingRootContext) : defaultInteractions,
  );

  const contextValue = useMemo(
    () => ({
      openState,
      floatingRootContext,
      placement,
      menuRegionId,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen,
      requestFocusFirstItemOnOpen,
      setRequestFocusFirstItemOnOpen,
      selectedItem,
      setSelectedItem,
    }),
    [
      openState,
      floatingRootContext,
      placement,
      menuRegionId,
      getFloatingProps,
      getReferenceProps,
      setOpen,
      requestFocusFirstItemOnOpen,
      selectedItem,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
};
