import { makePrefixer } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { ReactElement } from "react";
import { CircularProgress } from "../../progress";
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
