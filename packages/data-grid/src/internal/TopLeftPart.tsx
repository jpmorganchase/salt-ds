import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridColumnGroupModel, GridColumnModel } from "../Grid";

import { GroupHeaderRow } from "./GroupHeaderRow";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { useActiveOnWheel } from "./gridHooks";

import topLeftPartCss from "./TopLeftPart.css";

const withBaseName = makePrefixer("saltGridTopLeftPart");

export interface TopLeftPartProps<T> {
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  rightShadow?: boolean;
  bottomShadow?: boolean;
}

export function TopLeftPart<T>(props: TopLeftPartProps<T>) {
  const { onWheel, columns, columnGroups, rightShadow, bottomShadow } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-top-left-part",
    css: topLeftPartCss,
    window: targetWindow,
  });

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("rightShadow")]: rightShadow,
        [withBaseName("bottomShadow")]: bottomShadow,
      })}
      data-testid="grid-top-left-part"
    >
      <table ref={tableRef} role="presentation">
        <TableColGroup columns={columns} />
        <thead>
          <GroupHeaderRow groups={columnGroups} />
          <HeaderRow columns={columns} />
        </thead>
      </table>
    </div>
  );
}
