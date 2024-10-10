import { Button, type ButtonProps, useId } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import clsx from "clsx";
import { forwardRef } from "react";
import { useTabNext } from "./TabNextContext";

export interface TabNextActionProps extends ButtonProps {}

export const TabNextAction = forwardRef<HTMLButtonElement, TabNextActionProps>(
  function TabNextAction(props, ref) {
    const { id: idProp, ...rest } = props;

    const id = useId(idProp);
    const { focused, selected, tabId } = useTabNext();

    return (
      <Button
        aria-label="Close tab"
        id={id}
        aria-labelledby={clsx(id, tabId)}
        tabIndex={focused || selected ? undefined : -1}
        appearance="transparent"
        sentiment="neutral"
        ref={ref}
        {...rest}
      >
        <CloseIcon aria-hidden />
      </Button>
    );
  },
);
