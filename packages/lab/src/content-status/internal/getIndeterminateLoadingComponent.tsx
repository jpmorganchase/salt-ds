import { ReactElement } from "react";
import cx from "classnames";
import { Spinner } from "@jpmorganchase/uitk-lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ContentStatusProps } from "../ContentStatus";

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
      data-testid={`spinner-${id!}`}
      disableAnnouncer={disableAnnouncer}
      {...rest}
    />
  );
}
