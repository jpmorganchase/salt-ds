import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import "./TextCellEditor.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useEditorContext } from "./EditorContext";
import { GridColumnModel, GridRowModel } from "./Grid";

const withBaseName = makePrefixer("uitkGridTextCellEditor");

export interface TextCellEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function TextCellEditor<T>(props: TextCellEditorProps<T>) {
  const { column, row } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const { endEditMode, cancelEditMode, initialText } = useEditorContext();

  const [editorText, setEditorText] = useState<string>(
    initialText || column!.info.props.getValue!(row!.data)
  );

  const initialSelectionRef = useRef(!!initialText);

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

  useEffect(() => {
    if (inputRef.current && !initialSelectionRef.current) {
      inputRef.current.select();
      initialSelectionRef.current = true;
    }
  }, [inputRef.current]);

  return (
    <td className={withBaseName()}>
      <div className={withBaseName("inputContainer")}>
        <input
          ref={inputRef}
          autoFocus={true}
          value={editorText}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </td>
  );
}
