import { KeyboardEvent } from "react";
import cn from "classnames";
import { ForwardedRef, forwardRef, useCallback, useState } from "react";
import { makePrefixer } from "@brandname/core";

import { DeleteButton } from "./internal/DeleteButton";
import { PillBase, PillBaseProps } from "./internal/PillBase";
import { pillBaseName } from "./constants";

const deleteKeys = ["Enter", "Delete", "Backspace"];
const noop = () => undefined;

export interface ClosablePillProps extends Omit<PillBaseProps, "clickable"> {
  /**
   * Clickable Pill is not supported by Closable variant.
   */
  clickable?: false;
}

const withBaseName = makePrefixer(pillBaseName);

export const ClosablePill = forwardRef(function ClosablePill(
  {
    onDelete,
    label,
    disabled,
    onClick = noop,
    className,
    deleteIcon,
    ...rest
  }: PillBaseProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [active, setActive] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (deleteKeys.includes(event.key)) {
      setActive(true);
    }
  }, []);

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    setActive(false);
    if (!disabled && deleteKeys.includes(event.key)) {
      onDelete?.(event);
    }
  };

  return (
    <PillBase
      aria-roledescription="Closable Pill"
      className={cn(
        {
          [withBaseName("active")]: active,
        },
        className
      )}
      deletable
      deleteIcon={
        deleteIcon || <DeleteButton active={active} disabled={disabled} />
      }
      disabled={disabled}
      label={label}
      onDelete={onDelete}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      {...rest}
      ref={ref}
    />
  );
});
