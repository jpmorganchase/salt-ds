import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import "./TextCellEditor.css";
import { makePrefixer } from "@salt-ds/core";
import { useEditorContext } from "./EditorContext";
import { GridColumnModel, GridRowModel } from "./Grid";
import { CornerTag } from "./CornerTag";
import { Cell } from "./internal";

const withBaseName = makePrefixer("saltGridTextCellEditor");

export interface TextCellEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function TextCellEditor<T>(props: TextCellEditorProps<T>) {
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

  return (
    <Cell separator={column?.separator} className={withBaseName()}>
      <div className={withBaseName("inputContainer")}>
        <input
          data-testid="grid-cell-editor-input"
          ref={inputRef}
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
