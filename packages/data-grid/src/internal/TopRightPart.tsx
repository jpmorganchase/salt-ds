import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { useActiveOnWheel } from "./gridHooks";
import { HeaderRow } from "./HeaderRow";
import { TableColGroup } from "./TableColGroup";

import topRightPartCss from "./TopRightPart.css";

const withBaseName = makePrefixer("saltGridTopRightPart");

export interface TopRightPartProps<T> {
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  leftShadow?: boolean;
  bottomShadow?: boolean;
}

export function TopRightPart<T>(props: TopRightPartProps<T>) {
  const { onWheel, columns, columnGroups, leftShadow, bottomShadow } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-top-right-part",
    css: topRightPartCss,
    window: targetWindow,
  });

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("leftShadow")]: leftShadow,
        [withBaseName("bottomShadow")]: bottomShadow,
      })}
      data-testid="grid-top-right-part"
    >
      <table
        className={withBaseName("table")}
        ref={tableRef}
        role="presentation"
      >
        <TableColGroup columns={columns} />
        <thead>
          <GroupHeaderRow groups={columnGroups} />
          <HeaderRow columns={columns} />
          {/*TODO Do we need a toolbar?*/}
          {/*{showToolbar ? <HeaderToolbarRow columns={rightColumns} /> : null}*/}
        </thead>
      </table>
    </div>
  );
}
