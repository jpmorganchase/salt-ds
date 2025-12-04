import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
} from "react";
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

export const MenuTrigger = forwardRef<HTMLElement, MenuTriggerProps>(
  function MenuTrigger(props, ref) {
    const { children, ...rest } = props;

    const { getReferenceProps, refs, setFocusInside, focusInside, openState } =
      useMenuContext();
    const { setFocusInside: setFocusInsideParent } = useMenuPanelContext();

    const handleFloatingRef = useForkRef(
      getRefFromChildren(children),
      refs?.setReference,
    );
    const handleRef = useForkRef(handleFloatingRef, ref);

    if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
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
              ...rest,
            }),
            children.props,
          ),
          ref: handleRef,
        })}
      </MenuTriggerContext.Provider>
    );
  },
);
