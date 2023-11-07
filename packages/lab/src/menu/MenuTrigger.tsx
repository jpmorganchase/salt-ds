import { cloneElement, isValidElement, ReactNode, MouseEvent } from "react";
import { mergeProps, useForkRef } from "@salt-ds/core";
import { useMenuContext } from "./MenuContext";
import { MenuTriggerContext } from "./MenuTriggerContext";

export interface MenuTriggerProps {
  children?: ReactNode;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { children } = props;

  const { refs, setOpen, openState, submenu, activeState } = useMenuContext();

  const triggerRef = useForkRef(
    // @ts-ignore
    isValidElement(children) ? children.ref : null,
    refs.setReference
  );

  if (!children || !isValidElement(children)) {
    // Should we log or throw error?
    return children;
  }

  const handleClick = (event: MouseEvent) => {
    setOpen(event, !openState);
  };

  const handleHover = (event: MouseEvent) => {
    setOpen(event, true);
  };

  return (
    <MenuTriggerContext.Provider value={submenu}>
      {cloneElement(children, {
        ...mergeProps(
          {
            onClick: !submenu ? handleClick : undefined,
            onMouseOver: submenu ? handleHover : undefined,
          },
          children.props
        ),
        ref: triggerRef,
      })}
    </MenuTriggerContext.Provider>
  );
}
