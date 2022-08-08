import { EditorProps } from "../../model";
import { ChangeEventHandler } from "react";
import "./TextCellEditor.css";
import { useGridContext } from "../../GridContext";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridTextCellEditor");

export function TextCellEditor<T>(props: EditorProps<T, string>) {
  const { model } = useGridContext();
  const inputValue = model.editMode.useInputValue();

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    model.editMode.setInputValue(event.target.value);
  };

  return (
    <td className={withBaseName()}>
      <input value={inputValue} onChange={onChange} autoFocus={true} />
    </td>
  );
}
