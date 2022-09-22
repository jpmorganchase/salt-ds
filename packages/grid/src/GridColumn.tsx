import {
  ComponentType,
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { useGridContext } from "./GridContext";
import { GridColumnModel, GridRowModel } from "./Grid";
import { HeaderCellProps } from "./HeaderCell";

export type GridColumnPin = "left" | "right" | null;

export interface GridCellProps<T> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
  className?: string;
  style?: CSSProperties;
  isFocused?: boolean;
  isSelected?: boolean;
  children?: ReactNode;
}

export interface GridCellValueProps<T> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
  value?: T;
}

export interface GridHeaderValueProps<T> {
  column: GridColumnModel<T>;
}

export interface GridEditorProps<T> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
}

export interface GridColumnProps<T = any> {
  id: string; // TODO make optional
  name?: string;
  defaultWidth?: number;
  onWidthChanged?: (width: number) => void;
  pinned?: GridColumnPin;
  align?: "left" | "right";
  cellComponent?: ComponentType<GridCellProps<T>>;
  cellValueComponent?: ComponentType<GridCellValueProps<T>>;
  getValue?: (rowData: T) => any;
  headerClassName?: string;
  headerComponent?: ComponentType<HeaderCellProps<T>>;
  headerValueComponent?: ComponentType<GridHeaderValueProps<T>>;
  editable?: boolean;
  onChange?: (rowKey: string, rowIndex: number, value: string) => void;
  children?: ReactNode;
}

export interface GridColumnInfo<T> {
  width: number;
  onWidthChanged: (width: number) => void;
  props: GridColumnProps<T>;
}

export function GridColumn<T = any>(props: GridColumnProps<T>) {
  const { defaultWidth } = props;
  const [width, setWidth] = useState<number>(
    defaultWidth !== undefined ? defaultWidth : 100
  );

  const onWidthChanged = (w: number) => {
    setWidth(w);
    if (props.onWidthChanged) {
      props.onWidthChanged(w);
    }
  };

  const table = useGridContext();
  const info: GridColumnInfo<T> = {
    width,
    onWidthChanged,
    props,
  };

  useEffect(() => {
    table.onColumnAdded(info);
    return () => {
      table.onColumnRemoved(info);
    };
  });

  return (
    <>
      {Children.map(props.children, (ch) =>
        isValidElement(ch)
          ? cloneElement(ch, { columnId: props.id } as any)
          : ch
      )}
    </>
  );
}
