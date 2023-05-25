import {
  ChangeEventHandler,
  KeyboardEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridCellValueProps, GridColumn, GridColumnProps } from "./GridColumn";
import { GridColumnModel, GridRowModel } from "./Grid";
import { useEditorContext } from "./EditorContext";
import { CornerTag } from "./CornerTag";
import { Cell } from "./internal";

import numericColumnCss from "./NumericColumn.css";

export interface NumericColumnProps<T> extends GridColumnProps<T> {
  precision: number;
}

function isNumber(value: any): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function NumericCellValue<T>(props: GridCellValueProps<T>) {
  const { column, value } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-numeric-column",
    css: numericColumnCss,
    window: targetWindow,
  });

  const columnProps = column.info.props as NumericColumnProps<T>;
  const { precision } = columnProps;
  const text = isNumber(value) ? value.toFixed(precision) : "";
  return <div className="saltGridNumericCellValue">{text}</div>;
}

export interface NumericEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
  children?: ReactNode;
}

export function NumericCellEditor<T>(props: NumericEditorProps<T>) {
  const { column, row } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const { endEditMode, cancelEditMode, initialText } = useEditorContext();

  const [editorText, setEditorText] = useState<string>(
    initialText != null ? initialText : column!.info.props.getValue!(row!.data)
  );

  const initialSelectionRef = useRef(!!initialText);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEditorText(e.target.value);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      endEditMode(editorText);
      return;
    }
    if (event.key === "Escape") {
      cancelEditMode();
      return;
    }
    if (event.key === "Tab") {
      endEditMode(editorText);
      event.preventDefault();
      return;
    }
    event.stopPropagation();
  };

  useEffect(() => {
    if (inputRef.current && !initialSelectionRef.current) {
      inputRef.current.select();
      initialSelectionRef.current = true;
    }
  }, [inputRef.current]);

  useEffect(() => {
    const input = inputRef.current;
    const focusOut = (event: FocusEvent) => {
      if (!input?.contains(event.target as Node)) {
        endEditMode(editorText);
      }
    };

    // This uses the capture phase to detect clicks outside the input to avoid a race condition where the component gets unmounted when edit mode ends.
    document?.addEventListener("mousedown", focusOut, true);

    return () => {
      document?.removeEventListener("mousedown", focusOut, true);
    };
  }, [endEditMode, editorText]);

  return (
    <Cell separator={column?.separator} className="saltGridNumericCellEditor">
      <div className="saltGridNumericCellEditor-inputContainer">
        <input
          ref={inputRef}
          data-testid="grid-cell-editor-input"
          autoFocus={true}
          value={editorText}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
      <CornerTag />
    </Cell>
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
