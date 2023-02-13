import {
  Children,
  cloneElement,
  ComponentType,
  CSSProperties,
  isValidElement,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGridContext } from "./GridContext";
import { GridColumnModel, GridRowModel } from "./Grid";

export type GridColumnPin = "left" | "right" | null;

export interface GridCellProps<T> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
  className?: string;
  style?: CSSProperties;
  isFocused?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  children?: ReactNode;
}

export interface GridCellValueProps<T, U = any> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
  isFocused?: boolean;
  value?: U;
}

export interface HeaderCellProps<T> {
  column: GridColumnModel<T>;
  children: ReactNode;
  isFocused?: boolean;
}

export interface GridHeaderValueProps<T> {
  column: GridColumnModel<T>;
  isFocused?: boolean;
}

export interface GridEditorProps<T> {
  row: GridRowModel<T>;
  column: GridColumnModel<T>;
}

export interface GridColumnProps<T = any> {
  /**
   * Unique identifier of the column.
   * */
  id: string; // TODO make optional
  /**
   * Enables sorting for the column.
   * To enable column header's keyboard navigation on sort,
   * users need to set `headerIsFocusable` prop to `true` in Grid component.
   * */
  isSortable?: boolean;
  /**
   * Custom sorting function.
   * */
  customSort?: (args: {
    rowData: T[];
    sortByColumnId: string;
    sortOrder: string;
  }) => T[];
  /**
   * Name is displayed on the column header by default.
   * */
  name?: string;
  /**
   * Default width of the column in `px`.
   * */
  defaultWidth?: number;
  /**
   * Min width of the column.
   * */
  minWidth?: number;
  /**
   * Callback invoked when the user resizes the column.
   * */
  onWidthChanged?: (width: number) => void;
  /**
   * Whether the column should be pinned `left` or `right`. By default columns
   * are unpinned. Accepts `"left" | "right" | null`.
   * */
  pinned?: GridColumnPin;
  /**
   * Text align for the header and cells.
   * */
  align?: "left" | "right";
  /**
   * Component to render for every cell in the column. Useful when major
   * customization is needed. Use this only if `cellValueComponent` is not
   * sufficient. Default implementation of cell component takes care of
   * selection, hover, focus and other basic grid features.
   * */
  cellComponent?: ComponentType<GridCellProps<T>>;
  /**
   * Component to render inside every cell. This is the preferred way of
   * customizing grid cells.
   * */
  cellValueComponent?: ComponentType<GridCellValueProps<T>>;
  /**
   * Cell value getter. Should return the value to be displayed in the cell
   * for the given row data item.
   * */
  getValue?: (rowData: T) => any;
  /**
   * CSS class to be applied to the column header.
   * Useful for minor customizations
   * */
  headerClassName?: string;
  /**
   * Custom header component. Use this when `headerValueComponent` doesn't
   * provide enough flexibility.
   * */
  headerComponent?: ComponentType<HeaderCellProps<T>>;
  /**
   * Renders the content of the column header. This is the preferred way of
   * customizing column headers.
   * */
  headerValueComponent?: ComponentType<GridHeaderValueProps<T>>;
  /**
   * A callback to be invoked when the user modifies a cell value.
   * */
  onChange?: (row: T, rowIndex: number, value: string) => void;
  /**
   * A callback to be invoked on key down when the focus is in this column.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>, rowIndex: number) => void;
  /**
   * Children is optional, and accepts non-rendered elements i.e. `CellEditor`
   */
  children?: ReactNode;
}

export interface GridColumnInfo<T> {
  width: number;
  onWidthChanged: (width: number) => void;
  props: GridColumnProps<T>;
}

export const GridColumn = function GridColumn<T = any>(
  props: GridColumnProps<T>
) {
  const { defaultWidth } = props;
  const indexRef = useRef<number>();
  const [width, setWidth] = useState<number>(
    defaultWidth !== undefined ? defaultWidth : 100
  );

  const onWidthChanged = (w: number) => {
    setWidth(w);
    if (props.onWidthChanged) {
      props.onWidthChanged(w);
    }
  };

  const grid = useGridContext();

  const info: GridColumnInfo<T> = {
    width,
    onWidthChanged,
    props,
  };

  useEffect(() => {
    indexRef.current = grid.getChildIndex(props.id);
    grid.onColumnAdded(info);
    return () => {
      grid.onColumnRemoved(indexRef.current!, info);
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
};
