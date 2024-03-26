import { cloneElement, isValidElement, ReactNode } from "react";
import {mergeProps, useForkRef} from "@salt-ds/core";
import { useMenuContext } from "./MenuContext";
import { MenuTriggerContext } from "./MenuTriggerContext";

export interface MenuTriggerProps {
  children?: ReactNode;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { children } = props;

  const { getReferenceProps, refs } = useMenuContext();

  const handleRef = useForkRef(
    // @ts-expect-error error TS2339 missing property ref
    isValidElement(children) ? children.ref : null,
    refs.setReference
  );


  if (!children || !isValidElement(children)) {
    // Should we log or throw error?
    return <>{children}</>;
  }

  return (
    <MenuTriggerContext.Provider value={true}>
      {cloneElement(children, {
        ...mergeProps(
          getReferenceProps(),
          children.props
        ),
        ref: handleRef,
      })}
    </MenuTriggerContext.Provider>
  );
}
