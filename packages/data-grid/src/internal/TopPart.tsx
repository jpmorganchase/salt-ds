import { RefObject } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridColumnGroupModel, GridColumnModel } from "../Grid";

import { HeaderRow } from "./HeaderRow";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { TableColGroup } from "./TableColGroup";
import { useActiveOnWheel } from "./gridHooks";

import topPartCss from "./TopPart.css";

const withBaseName = makePrefixer("saltGridTopPart");

export interface TopPartProps<T> {
  topRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  midGap: number;
  bottomShadow?: boolean;
}

export function TopPart<T>(props: TopPartProps<T>) {
  const { topRef, onWheel, columns, columnGroups, midGap, bottomShadow } =
    props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-top-part",
    css: topPartCss,
    window: targetWindow,
  });

  const tableRef = useActiveOnWheel(onWheel);

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("bottomShadow")]: bottomShadow,
      })}
      ref={topRef}
      data-testid="grid-top-part"
    >
      <div className={withBaseName("space")}>
        <table ref={tableRef} role="presentation">
          <TableColGroup columns={columns} gap={midGap} />
          <thead>
            <GroupHeaderRow groups={columnGroups} gap={midGap} />
            <HeaderRow columns={columns} gap={midGap} />
          </thead>
        </table>
      </div>
    </div>
  );
}
