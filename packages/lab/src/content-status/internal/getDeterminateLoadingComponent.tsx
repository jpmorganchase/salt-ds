import { ReactElement } from "react";
import cx from "classnames";
import { CircularProgress } from "@jpmorganchase/uitk-lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ContentStatusProps } from "../ContentStatus";

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
