import { BehaviorSubject, combineLatest, map } from "rxjs";
import { ColumnDefinition } from "../ColumnDefinition";
import { ColumnGroupDefinition } from "../ColumnGroupDefinition";
import { ColumnGroup } from "../ColumnGroup";
import { Column } from "../Column";
import { ColumnsAndGroups } from "../GridModel";
import { RowSelectionCheckboxCellValue } from "../../column-types/row-selection-checkbox/RowSelectionCheckboxCellValue";
import { RowSelectionCheckboxHeaderValue } from "../../column-types/row-selection-checkbox/RowSelectionCheckboxHeaderValue";
import { AutoSizingHeaderCell } from "../../components";

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

export function addAutoColumnsAndGroups<T>(
  userColumnsAndGroups$: BehaviorSubject<ColumnsAndGroups<T>>,
  showCheckboxes$: BehaviorSubject<boolean | undefined>
): BehaviorSubject<ColumnsAndGroups<T>> {
  const columnsAndGroups$ = new BehaviorSubject<ColumnsAndGroups<T>>(
    userColumnsAndGroups$.getValue()
  );
  combineLatest([userColumnsAndGroups$, showCheckboxes$])
    .pipe(
      map(([userColumnsAndGroups, showCheckboxes]) => {
        const { rightColumns, rightColumnGroups } = userColumnsAndGroups;
        let {
          leftColumns,
          leftColumnGroups,
          middleColumns,
          middleColumnGroups,
        } = userColumnsAndGroups;
        // Add checkbox column and group if showCheckboxes is set to true
        if (showCheckboxes) {
          const checkboxColumnDefinition: ColumnDefinition<T> = {
            key: "rowSelector",
            title: "",
            width: 100,
            pinned: "left",
            cellValueComponent: RowSelectionCheckboxCellValue,
            headerComponent: AutoSizingHeaderCell,
            headerValueComponent: RowSelectionCheckboxHeaderValue,
          } as ColumnDefinition<T>;
          const checkboxColumn = new Column(checkboxColumnDefinition);
          if (
            leftColumnGroups != undefined &&
            middleColumnGroups != undefined &&
            rightColumnGroups != undefined
          ) {
            const checkboxColumnGroup = new ColumnGroup({
              key: "rowSelectorGroup",
              pinned: "left",
              title: "",
              columns: [checkboxColumnDefinition],
            });
            leftColumnGroups = [checkboxColumnGroup, ...leftColumnGroups];
          }
          leftColumns = [checkboxColumn, ...leftColumns];
        }
        // Add an empty column to fill the space
        // If nothing is pinned to the right
        if (rightColumns.length === 0) {
          const emptyColumnDefinition: ColumnDefinition<T> = {
            key: "emptyColumn",
            title: "",
            width: 100,
          };
          const emptyColumn = new Column(emptyColumnDefinition);
          if (
            leftColumnGroups != undefined &&
            middleColumnGroups != undefined &&
            rightColumnGroups != undefined
          ) {
            const emptyColumnGroup = new ColumnGroup({
              key: "emptyColumnGroup",
              title: "",
              columns: [emptyColumnDefinition],
            });
            middleColumnGroups = [...middleColumnGroups, emptyColumnGroup];
          }
          middleColumns = [...middleColumns, emptyColumn];
        }
        // Set column/group indices (this should be moved to another function probably)
        if (
          leftColumnGroups != undefined &&
          middleColumnGroups != undefined &&
          rightColumnGroups != undefined
        ) {
          const allGroups = [
            ...leftColumnGroups,
            ...middleColumnGroups,
            ...rightColumnGroups,
          ];
          allGroups.forEach((group, groupIndex) => {
            group.index = groupIndex;
          });
          if (allGroups.length > 0) {
            allGroups[0].rowSeparator.next("first");
            allGroups[allGroups.length - 1].rowSeparator.next("last");
          }
        }
        [...leftColumns, ...middleColumns, ...rightColumns].forEach(
          (column, columnIndex) => {
            column.index = columnIndex;
          }
        );
        return {
          leftColumns,
          middleColumns,
          rightColumns,
          leftColumnGroups,
          middleColumnGroups,
          rightColumnGroups,
        };
      })
    )
    .subscribe(columnsAndGroups$);
  return columnsAndGroups$;
}
