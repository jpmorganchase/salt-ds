import { BehaviorSubject, combineLatest } from "rxjs";
import { ColumnDefinition } from "../ColumnDefinition";
import { ColumnGroupDefinition } from "../ColumnGroupDefinition";
import { ColumnGroup } from "../ColumnGroup";
import { Column } from "../Column";
import { ColumnsAndGroups } from "../GridModel";

export function createColumnsAndColumnGroups<T>(
  columnDefinitions: BehaviorSubject<ColumnDefinition<T>[] | undefined>,
  columnGroupDefinitions: BehaviorSubject<
    ColumnGroupDefinition<T>[] | undefined
  >
) {
  const columnsAndGroups$ = new BehaviorSubject<ColumnsAndGroups<T>>({
    leftColumns: [],
    middleColumns: [],
    rightColumns: [],
  });

  combineLatest([columnDefinitions, columnGroupDefinitions]).subscribe(
    ([columnDefinitions, columnGroupDefinitions]) => {
      if (columnGroupDefinitions) {
        const leftGroups: ColumnGroup<T>[] = [];
        const rightGroups: ColumnGroup<T>[] = [];
        const middleGroups: ColumnGroup<T>[] = [];

        const leftColumns: Column<T>[] = [];
        const rightColumns: Column<T>[] = [];
        const middleColumns: Column<T>[] = [];

        columnGroupDefinitions.forEach((groupDef) => {
          const columns: Column<T>[] = groupDef.columns.map(
            (colDef) => new Column(colDef)
          );
          if (columns.length > 0) {
            columns[columns.length - 1].separator$.next("groupEdge");
          }
          const group: ColumnGroup<T> = new ColumnGroup(groupDef);
          group.columns.next(columns);
          columns.forEach((column) =>
            column.pinned$.next(groupDef.pinned || null)
          );

          if (groupDef.pinned === "left") {
            leftGroups.push(group);
            leftColumns.push(...columns);
          } else if (groupDef.pinned === "right") {
            rightGroups.push(group);
            rightColumns.push(...columns);
          } else {
            middleGroups.push(group);
            middleColumns.push(...columns);
          }
        });

        [...leftColumns, ...middleColumns, ...rightColumns].forEach(
          (column, columnIndex) => {
            column.index = columnIndex;
          }
        );
        const allGroups = [...leftGroups, ...middleGroups, ...rightGroups];
        allGroups.forEach((group, groupIndex) => {
          group.index = groupIndex;
        });
        if (allGroups.length > 0) {
          allGroups[0].rowSeparator.next("first");
          allGroups[allGroups.length - 1].rowSeparator.next("last");
        }

        columnsAndGroups$.next({
          leftColumns,
          middleColumns,
          rightColumns,
          leftColumnGroups: leftGroups,
          middleColumnGroups: middleGroups,
          rightColumnGroups: rightGroups,
        });
      } else {
        const leftColumns: Column<T>[] = [];
        const rightColumns: Column<T>[] = [];
        const middleColumns: Column<T>[] = [];

        if (!columnDefinitions) {
          columnDefinitions = [];
        }

        columnDefinitions.forEach((colDef) => {
          const column = new Column(colDef);
          if (colDef.pinned === "left") {
            leftColumns.push(column);
          } else if (colDef.pinned === "right") {
            rightColumns.push(column);
          } else {
            middleColumns.push(column);
          }
        });
        [...leftColumns, ...middleColumns, ...rightColumns].forEach(
          (column, columnIndex) => {
            column.index = columnIndex;
          }
        );

        columnsAndGroups$.next({
          leftColumns,
          middleColumns,
          rightColumns,
        });
      }
    }
  );

  return columnsAndGroups$;
}
