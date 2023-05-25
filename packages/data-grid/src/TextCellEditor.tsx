import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { useEditorContext } from "./EditorContext";
import { GridColumnModel, GridRowModel } from "./Grid";
import { CornerTag } from "./CornerTag";
import { Cell } from "./internal";

import textCellEditorCss from "./TextCellEditor.css";

const withBaseName = makePrefixer("saltGridTextCellEditor");

export interface TextCellEditorProps<T> {
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function TextCellEditor<T>(props: TextCellEditorProps<T>) {
  const { column, row } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-text-cell-editor",
    css: textCellEditorCss,
    window: targetWindow,
  });

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
