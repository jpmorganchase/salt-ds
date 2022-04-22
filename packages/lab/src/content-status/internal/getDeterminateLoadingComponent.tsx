import cx from "classnames";
import { CircularProgress } from "@brandname/lab";
import { makePrefixer } from "@brandname/core";
import { ContentStatusProps } from "../ContentStatus";
import { ReactElement } from "react";

const withBaseName = makePrefixer("uitkContentStatus");

export function getDeterminateLoadingComponent({
  unit,
  value,
  title,
  message,
  CircularProgressProps: { className, ...rest } = {},
}: Partial<ContentStatusProps>): ReactElement {
  return (
    <CircularProgress
      aria-label={title || message}
      className={cx(withBaseName("determinateLoading"), className)}
      size="small"
      unit={unit}
      value={value}
      {...rest}
    />
  );
}
