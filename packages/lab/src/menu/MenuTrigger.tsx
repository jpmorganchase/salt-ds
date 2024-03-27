import { cloneElement, isValidElement, ReactNode } from "react";
import { mergeProps, useForkRef } from "@salt-ds/core";
import { useMenuContext } from "./MenuContext";
import { MenuTriggerContext } from "./MenuTriggerContext";
import { useMenuPanelContext } from "./MenuPanelContext";

export interface MenuTriggerProps {
  children?: ReactNode;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { children } = props;

  const { getReferenceProps, refs, setFocusInside, focusInside, openState } =
    useMenuContext();
  const { setFocusInside: setFocusInsideParent } = useMenuPanelContext();

  const handleRef = useForkRef(
    // @ts-expect-error error TS2339 missing property ref
    isValidElement(children) ? children.ref : null,
    refs?.setReference
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
          children.props
        ),
        ref: handleRef,
      })}
    </MenuTriggerContext.Provider>
  );
}
