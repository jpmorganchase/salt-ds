import { Button, type ButtonProps, useId } from "@salt-ds/core";
import clsx from "clsx";
import { forwardRef } from "react";
import { useTabNext } from "./TabNextContext";

export interface TabNextActionProps extends ButtonProps {}

export const TabNextAction = forwardRef<HTMLButtonElement, TabNextActionProps>(
  function TabNextAction(props, ref) {
    const { "aria-labelledby": ariaLabelledBy, id: idProp, ...rest } = props;

    const id = useId(idProp);
    const { focused, selected, tabId } = useTabNext();

    return (
      <Button
        id={id}
        aria-labelledby={clsx(ariaLabelledBy, id, tabId)}
        tabIndex={focused || selected ? undefined : -1}
        appearance="transparent"
        sentiment="neutral"
        ref={ref}
        {...rest}
      />
    );
  },
);
