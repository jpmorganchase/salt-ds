import {
  Button,
  Card,
  ControlLabel,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import {
  GroupByColumn,
  RowGroupingLevelModel,
  RowGroupingModel,
} from "./RowGroupingModel";
import { useMemo } from "react";
import { AddIcon, DeleteIcon } from "@jpmorganchase/uitk-icons";
import "./RowGrouping.css";
import { Dropdown, SelectionChangeHandler } from "@jpmorganchase/uitk-lab";

const withBaseName = makePrefixer("uitkDataGridRowGrouping");

export interface RowGroupingLevelProps<T> {
  index: number;
  model: RowGroupingLevelModel<T>;
  onAdd: (index: number) => void;
  onDelete: (index: number) => void;
}

export const RowGroupingLevel = function RowGroupingLevel<T>(
  props: RowGroupingLevelProps<T>
) {
  const { model, index, onAdd, onDelete } = props;

  const column = model.useColumn();
  const columns = model.useColumns();

  const [columnNames, columnsByName] = useMemo(
    () => [
      columns.map((c) => c.name),
      new Map<string, GroupByColumn<T>>(
        columns.map((c) => [c.name, c] as [string, GroupByColumn<T>])
      ),
    ],
    [columns]
  );

  const onColumnChange: SelectionChangeHandler = (event, selectedItem) => {
    model.setColumn(
      selectedItem != null ? columnsByName.get(selectedItem) : undefined
    );
  };

  const onAddRow = () => {
    onAdd(index);
  };

  const onDeleteRow = () => {
    onDelete(index);
  };

  return (
    <Card>
      <div className={withBaseName("row")}>
        <div className={withBaseName("row-title")}>
          <ControlLabel label={index === 0 ? "Group by" : "then by"} />
        </div>
        <div className={withBaseName("row-column")}>
          <Dropdown
            className={withBaseName("dropdown")}
            fullWidth={true}
            source={columnNames}
            selected={column ? column.name : null}
            onSelectionChange={onColumnChange}
          />
        </div>
        <Button
          className={withBaseName("row-delete")}
          variant={"secondary"}
          onClick={onDeleteRow}
        >
          <DeleteIcon />
        </Button>
        <Button variant={"secondary"} onClick={onAddRow}>
          <AddIcon />
        </Button>
      </div>
    </Card>
  );
};

export interface RowGroupingProps<T> {
  model: RowGroupingModel<T>;
}

export const RowGrouping = function RowGrouping<T>(props: RowGroupingProps<T>) {
  const { model } = props;
  const levels = model.useLevels();

  const onAddLevel = (index: number) => {
    model.addLevel(index);
  };

  const onDeleteLevel = (index: number) => {
    model.deleteLevel(index);
  };

  return (
    <div className={withBaseName()}>
      {levels.map((level, index) => {
        return (
          <RowGroupingLevel
            key={index}
            index={index}
            model={level}
            onAdd={onAddLevel}
            onDelete={onDeleteLevel}
          />
        );
      })}
    </div>
  );
};
