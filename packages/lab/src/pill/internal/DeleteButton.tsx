import { CloseSmallIcon } from "@salt-ds/icons";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { MouseEvent } from "react";
import { pillBaseName } from "../constants";

export interface DeleteButtonProps extends ButtonProps {
  /**
   * Active state.
   */
  active?: boolean;
}

const withBaseName = makePrefixer(pillBaseName);

export const DeleteButton = (props: DeleteButtonProps) => {
  const { disabled, active, className, ...restProps } = props;
  return (
    <Button
      aria-hidden="true"
      className={clsx(
        withBaseName("deleteButton"),
        {
          [withBaseName("deleteButton-disabled")]: disabled,
          [withBaseName("deleteButton-active")]: active,
        },
        className
      )}
      data-testid="pill-delete-button"
      disabled={disabled}
      onMouseEnter={(event: MouseEvent<HTMLButtonElement>) =>
        event.stopPropagation()
      }
      tabIndex={-1}
      variant="secondary"
      {...restProps}
    >
      <CloseSmallIcon className={withBaseName("deleteIcon")} />
    </Button>
  );
};
