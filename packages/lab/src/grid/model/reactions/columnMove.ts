import { BehaviorSubject, Subject } from "rxjs";
import { ColumnMoveEvent, ColumnsAndGroups } from "../GridModel";
import { Column } from "../Column";
import { ColumnGroup } from "../ColumnGroup";

// Listens to columnMove$ and updates columnsAndGroup$ accordingly
export function columnMove(
  columnMove$: Subject<ColumnMoveEvent>,
  columnsAndGroups$: BehaviorSubject<ColumnsAndGroups>
) {
  columnMove$.subscribe(function columnMove({ columnIndex, newIndex }) {
    let {
      leftColumns,
      middleColumns,
      rightColumns,
      leftColumnGroups,
      middleColumnGroups,
      rightColumnGroups,
    } = columnsAndGroups$.getValue();

    const allColumns = [...leftColumns, ...middleColumns, ...rightColumns];

    const columnToMove = allColumns.find((c) => c.index === columnIndex);

    if (!columnToMove) {
      throw new Error(`Cannot move column ${columnIndex}. Column not found.`);
    }

    const updateGroups = function updateGroups(groups: ColumnGroup[]) {
      const newGroups: ColumnGroup[] = [];
      for (let group of groups) {
        const groupColumns = group.columns.getValue();
        const newColumns: Column[] = [];
        for (let c of groupColumns) {
          if (c.index === newIndex) {
            newColumns.push(columnToMove!);
          }
          if (c.index !== columnIndex) {
            newColumns.push(c);
          }
          if (
            newIndex === allColumns.length &&
            c.index === allColumns.length - 1
          ) {
            newColumns.push(columnToMove!);
          }
        }
        if (newColumns.length > 0) {
          group.columns.next(newColumns);
          newGroups.push(group);
        }
      }
      return newGroups;
    };

    const columnsFromGroups = (groups: ColumnGroup[]) => {
      const columns: Column[] = [];
      for (let g of groups) {
        for (let column of g.columns.getValue()) {
          columns.push(column);
        }
      }
      return columns;
    };

    const updateColumns = (columns: Column[]) => {
      const newColumns: Column[] = [];
      for (let column of columns) {
        if (column.index === newIndex) {
          newColumns.push(columnToMove);
        }
        if (column.index !== columnIndex) {
          newColumns.push(column);
        }
        if (
          column.index === allColumns.length - 1 &&
          newIndex === allColumns.length
        ) {
          newColumns.push(columnToMove);
        }
      }
      return newColumns;
    };

    const updateGroupIndicesAndSeparators = (groups: ColumnGroup[]) => {
      groups.forEach((g, i) => {
        g.index = i;
        g.rowSeparator.next("regular");
        // g.columnSeparator.next("regular"); // TODO
        const columns = g.columns.getValue();
        columns.forEach((c, k) => {
          c.separator$.next(k === columns.length - 1 ? "groupEdge" : "regular");
        });
      });
      groups[0].rowSeparator.next("first");
      groups[groups.length - 1].rowSeparator.next("last");
    };

    if (leftColumnGroups && middleColumnGroups && rightColumnGroups) {
      leftColumnGroups = updateGroups(leftColumnGroups);
      middleColumnGroups = updateGroups(middleColumnGroups);
      rightColumnGroups = updateGroups(rightColumnGroups);
      updateGroupIndicesAndSeparators([
        ...leftColumnGroups,
        ...middleColumnGroups,
        ...rightColumnGroups,
      ]);
      leftColumns = columnsFromGroups(leftColumnGroups);
      middleColumns = columnsFromGroups(middleColumnGroups);
      rightColumns = columnsFromGroups(rightColumnGroups);
    } else {
      leftColumns = updateColumns(leftColumns);
      middleColumns = updateColumns(middleColumns);
      rightColumns = updateColumns(rightColumns);
    }
    [...leftColumns, ...middleColumns, ...rightColumns].forEach((c, i) => {
      c.index = i;
    });

    columnsAndGroups$.next({
      leftColumns,
      middleColumns,
      rightColumns,
      leftColumnGroups,
      middleColumnGroups,
      rightColumnGroups,
    });
  });
}
