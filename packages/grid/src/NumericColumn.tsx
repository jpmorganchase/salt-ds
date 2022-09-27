import { GridCellValueProps, GridColumn, GridColumnProps } from "./GridColumn";
import "./NumericColumn.css";
import { GridColumnModel, GridRowModel } from "./Grid";
import {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
  useState,
} from "react";
import { useEditorContext } from "./EditorContext";
import { CellEditor } from "./CellEditor";

export interface NumericColumnProps<T> extends GridColumnProps<T> {
  precision: number;
}

function isNumber(value: any): value is number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return true;
  }
  return false;
}

export function NumericCellValue<T>(props: GridCellValueProps<T>) {
  const { column, value, row } = props;
  const columnProps = column.info.props as NumericColumnProps<T>;
  const { precision } = columnProps;
  // console.log(`Precision: ${precision}`);
  const text = isNumber(value) ? value.toFixed(precision) : "";
  return <div className="uitkGridNumericCellValue">{text}</div>;
}

export interface NumericEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
  children?: ReactNode;
}

export function NumericCellEditor<T>(props: NumericEditorProps<T>) {
  const { column, row } = props;
  const [editorText, setEditorText] = useState<string>(
    column!.info.props.getValue!(row!.data)
  );

  const { endEditMode, cancelEditMode } = useEditorContext();

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEditorText(e.target.value);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      endEditMode(editorText);
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.key === "Escape") {
      cancelEditMode();
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.stopPropagation();
    }
  };

  return (
    <td className="uitkGridNumericCellEditor">
      <div className="uitkGridNumericCellEditor-inputContainer">
        <input
          autoFocus={true}
          value={editorText}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </td>
  );
}

export function NumericColumn<T>(props: NumericColumnProps<T>) {
  return (
    <GridColumn
      {...props}
      align={"right"}
      cellValueComponent={NumericCellValue}
    >
      {props.children}
    </GridColumn>
  );
}
