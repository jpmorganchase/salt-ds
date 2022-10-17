import {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  useState,
} from "react";
import "./TextCellEditor.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useEditorContext } from "./EditorContext";
import { GridEditorProps } from "./GridColumn";
import { GridColumnModel, GridRowModel } from "./Grid";

const withBaseName = makePrefixer("uitkGridTextCellEditor");

export interface TextCellEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function TextCellEditor<T>(props: TextCellEditorProps<T>) {
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
    <td className={withBaseName()}>
      <div className={withBaseName("inputContainer")}>
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
