import {
  type Placement,
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { useControlled } from "@salt-ds/core";
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
import { useMegaMenuKeyboard } from "./useMegaMenuKeyboard";

export interface MegaMenuProps extends MegaMenuCustomInteractions {
  /**
   * The content of the mega menu, typically `MegaMenuTrigger` and `MegaMenuPanel`.
   */
  children?: ReactNode;
  /**
   * Whether the mega menu is open. Use for controlled mode.
   */
  open?: boolean;
  /**
   * Whether the mega menu is initially open. Use for uncontrolled mode.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The currently selected item value. Use for controlled mode.
   */
  selectedItem?: string;
  /**
   * The initially selected item value. Use for uncontrolled mode.
   */
  defaultSelectedItem?: string;
  /**
   * Callback fired when the selected item changes.
   */
  onSelectedItemChange?: (selectedItem: string | undefined) => void;
  /**
   * The placement of the mega menu panel relative to the trigger.
   * @default "bottom"
   */
  placement?: Placement;
}

export function MegaMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  selectedItem: selectedItemProp,
  defaultSelectedItem,
  onSelectedItemChange,
  placement = "bottom",
  interactions,
}: MegaMenuProps) {
  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: defaultOpen,
    name: "MegaMenu",
    state: "open",
  });

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const [focusFirstItemOnOpen, setFocusFirstItemOnOpen] = useState(false);
  const [panelId, setPanelId] = useState<string | undefined>(undefined);

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
      setSelectedItemState((current) => {
        const next =
          typeof newSelectedItem === "function"
            ? newSelectedItem(current)
            : newSelectedItem;
        onSelectedItemChange?.(next);
        return next;
      });
    },
    [onSelectedItemChange, setSelectedItemState],
  );

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setFocusFirstItemOnOpen(false);
      }
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: setOpen,
    elements: { reference, floating },
  });

  const megaMenuKeyboard = useMegaMenuKeyboard(floatingRootContext);

  const defaultInteractions = [
    useClick(floatingRootContext, { toggle: true }),
    useDismiss(floatingRootContext, { bubbles: true }),
    megaMenuKeyboard,
  ];

  const { getReferenceProps, getFloatingProps } = useInteractions(
    interactions
      ? [...interactions(floatingRootContext), megaMenuKeyboard]
      : defaultInteractions,
  );

  const contextValue = useMemo(
    () => ({
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen,
      selectedItem,
      setSelectedItem,
      focusFirstItemOnOpen,
      setFocusFirstItemOnOpen,
      panelId,
      setPanelId,
    }),
    [
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen,
      selectedItem,
      setSelectedItem,
      focusFirstItemOnOpen,
      setFocusFirstItemOnOpen,
      panelId,
      setPanelId,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
}
