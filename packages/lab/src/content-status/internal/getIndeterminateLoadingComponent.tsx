import cx from "classnames";
import { Spinner } from "@brandname/lab";
import { makePrefixer } from "@brandname/core";
import { ContentStatusProps } from "../ContentStatus";
import { ReactElement } from "react";

const withBaseName = makePrefixer("uitkContentStatus");

export function getIndeterminateLoadingComponent({
  disableAnnouncer,
  id,
  SpinnerProps: { className, ...rest } = {},
}: ContentStatusProps): ReactElement {
  return (
    <Spinner
      className={cx(withBaseName("indeterminateLoading"), className)}
      // Announcement of the content status is more useful than completion announcement from spinner
      completionAnnouncement={null}
      data-jpmui-test={`spinner-${id!}`}
      disableAnnouncer={disableAnnouncer}
      {...rest}
    />
  );
}
