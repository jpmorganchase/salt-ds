import { type ReactNode, cloneElement, isValidElement } from "react";
import { getRefFromChildren, mergeProps, useForkRef } from "../utils";
import { useMenuContext } from "./MenuContext";
import { useMenuPanelContext } from "./MenuPanelContext";
import { MenuTriggerContext } from "./MenuTriggerContext";

export interface MenuTriggerProps {
  /**
   * The trigger element for the menu. This should be a single child element and accept a ref.
   */
  children?: ReactNode;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { children } = props;

  const { getReferenceProps, refs, setFocusInside, focusInside, openState } =
    useMenuContext();
  const { setFocusInside: setFocusInsideParent } = useMenuPanelContext();

  const handleRef = useForkRef(
    getRefFromChildren(children),
    refs?.setReference,
  );

  if (!children || !isValidElement(children)) {
    // Should we log or throw error?
    return <>{children}</>;
  }

  return (
    <MenuTriggerContext.Provider
      value={{ triggersSubmenu: true, blurActive: focusInside && openState }}
    >
      {cloneElement(children, {
        ...mergeProps(
          getReferenceProps({
            onFocus() {
              setFocusInsideParent(true);
              setFocusInside(false);
            },
          }),
          children.props,
        ),
        ref: handleRef,
      })}
    </MenuTriggerContext.Provider>
  );
}
