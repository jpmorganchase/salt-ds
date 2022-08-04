import {
  Button,
  Card,
  ControlLabel,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import { SortColumn, SortItemModel, SortModel } from "./SortModel";
import { useMemo } from "react";
import "./Sort.css";
import { AddIcon, DeleteIcon } from "@jpmorganchase/uitk-icons";
import {
  Dropdown,
  SelectionChangeHandler,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "@jpmorganchase/uitk-lab";

const withBaseName = makePrefixer("uitkDataGridSort");

export interface SortItemProps<T> {
  index: number;
  model: SortItemModel<T>;
  onAdd: (index: number) => void;
  onDelete: (index: number) => void;
}

export const SortItem = function SortItem<T>(props: SortItemProps<T>) {
  const { model, index, onAdd, onDelete } = props;
  const column = model.useColumn();
  const order = model.useOrder();
  const columns = model.columns;

  const [columnNames, columnsByName] = useMemo(
    () => [
      columns.map((c) => c.name),
      new Map<string, SortColumn<T>>(
        columns.map((c) => [c.name, c] as [string, SortColumn<T>])
      ),
    ],
    [columns]
  );

  const onColumnChange: SelectionChangeHandler = (event, selectedItem) => {
    model.setColumn(selectedItem ? columnsByName.get(selectedItem) : undefined);
  };

  const onOrderChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    if (toggled) {
      model.setOrder(index === 0 ? "ascending" : "descending");
    }
  };

  const onAddItem = () => {
    onAdd(index);
  };

  const onDeleteItem = () => {
    onDelete(index);
  };

  return (
    <Card>
      <div className={withBaseName("item")}>
        <div className={withBaseName("item-title")}>
          <ControlLabel label={index === 0 ? "Sort by" : "then by"} />
        </div>
        <div className={withBaseName("item-column")}>
          <Dropdown
            className={withBaseName("dropdown")}
            fullWidth={true}
            source={columnNames}
            selected={column ? column.name : null}
            onSelectionChange={onColumnChange}
          />
        </div>
        <div className={withBaseName("item-order")}>
          <ToggleButtonGroup
            onChange={onOrderChange}
            selectedIndex={order === "ascending" ? 0 : 1}
          >
            <ToggleButton>A-Z</ToggleButton>
            <ToggleButton>Z-A</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <Button
          className={withBaseName("item-delete")}
          variant="secondary"
          onClick={onDeleteItem}
        >
          <DeleteIcon />
        </Button>
        <Button
          className={withBaseName("item-add")}
          variant="secondary"
          onClick={onAddItem}
        >
          <AddIcon />
        </Button>
      </div>
    </Card>
  );
};

export interface SortProps<T> {
  model: SortModel<T>;
}

export const Sort = function Sort<T>(props: SortProps<T>) {
  const { model } = props;
  const items = model.useItems();

  const onAddItem = (index: number) => {
    model.addItem(index);
  };

  const onDeleteItem = (index: number) => {
    model.deleteItem(index);
  };

  return (
    <div className={withBaseName()}>
      {items.map((item, index) => {
        return (
          <SortItem
            key={index}
            model={item}
            index={index}
            onAdd={onAddItem}
            onDelete={onDeleteItem}
          />
        );
      })}
    </div>
  );
};
