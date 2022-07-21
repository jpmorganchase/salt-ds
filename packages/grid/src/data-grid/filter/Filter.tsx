import {
  FilterColumn,
  FilterModel,
  FilterRowKind,
  FilterRowModel,
} from "./FilterModel";
import {
  Button,
  Card,
  ControlLabel,
  Input,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import { AddIcon, DeleteIcon } from "@jpmorganchase/uitk-icons";
import { ChangeEvent, useMemo } from "react";
import "./Filter.css";
import { Dropdown, ListChangeHandler } from "@jpmorganchase/uitk-lab";

const withBaseName = makePrefixer("uitkDataGridFilter");

export interface FilterRowProps<T> {
  index: number;
  model: FilterRowModel<T>;
  onAdd: (index: number) => void;
  onDelete: (index: number) => void;
}

export const FilterRow = function FilterRow<T>(props: FilterRowProps<T>) {
  const { model, index, onAdd, onDelete } = props;
  const kind = model.useKind();
  const column = model.useColumn();
  const columns = model.useColumns();
  const operator = model.useOperator();
  const operators = model.useOperators();
  const query = model.useQuery();

  const [columnNames, columnsByName] = useMemo(
    () => [
      columns.map((c) => c.name),
      new Map<string, FilterColumn<T>>(
        columns.map((c) => [c.name, c] as [string, FilterColumn<T>])
      ),
    ],
    [columns]
  );

  const onKindChange: ListChangeHandler = (event, selectedItem) => {
    if (selectedItem != null) {
      model.setKind(selectedItem as FilterRowKind);
    }
  };

  const onOperatorChange: ListChangeHandler = (event, selectedItem) => {
    if (selectedItem != null) {
      model.setOperator(selectedItem);
    }
  };

  const onColumnChange: ListChangeHandler = (event, selectedItem) => {
    if (selectedItem != null) {
      model.setColumn(columnsByName.get(selectedItem));
    }
  };

  const onQueryChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    model.setQuery(value);
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
        <div className={withBaseName("row-kind")}>
          {kind === "where" ? (
            <ControlLabel label="Where" className={withBaseName("where")} />
          ) : (
            <Dropdown
              fullWidth={true}
              source={["and"]}
              selectedItem={kind}
              onChange={onKindChange}
              WindowProps={{
                className: withBaseName("window"),
              }}
            />
          )}
        </div>
        <div className={withBaseName("row-column")}>
          <Dropdown
            fullWidth={true}
            source={columnNames}
            selectedItem={column ? column.name : (null as any)}
            onChange={onColumnChange}
            WindowProps={{
              className: withBaseName("window"),
            }}
          />
        </div>
        <div className={withBaseName("row-operator")}>
          <Dropdown
            fullWidth={true}
            source={operators}
            selectedItem={operator}
            onChange={onOperatorChange}
            WindowProps={{
              className: withBaseName("window"),
            }}
          />
        </div>
        <div className={withBaseName("row-query")}>
          <Input value={query} onChange={onQueryChange} />
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

export interface FilterProps<T> {
  model: FilterModel<T>;
}

export const Filter = function Filter<T>(props: FilterProps<T>) {
  const { model } = props;
  const rows = model.useRows();

  const onAddRow = (rowIndex: number) => {
    model.addRow(rowIndex);
  };

  const onDeleteRow = (rowIndex: number) => {
    model.deleteRow(rowIndex);
  };

  return (
    <div className={withBaseName()}>
      {rows.map((row, index) => {
        return (
          <FilterRow
            key={index}
            model={row}
            index={index}
            onAdd={onAddRow}
            onDelete={onDeleteRow}
          />
        );
      })}
    </div>
  );
};
