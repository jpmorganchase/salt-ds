import { useState, KeyboardEvent } from "react";
import { isEditableElement } from "./tab-utils";

const editKeys = new Set(["Enter", " "]);
const isEditKey = (key: string) => editKeys.has(key);

type ExitEditModeHandler = (
  originalValue: string,
  editedValue: string,
  allowDeactivation: boolean,
  tabIndex: number
) => void;

type editableItemHook = () => {
  editing: boolean;
  onEnterEditMode: () => void;
  onExitEditMode: ExitEditModeHandler;
  onKeyDown: (evt: KeyboardEvent, tabIndex: number) => void;
  setEditing: (value: boolean) => void;
};

export const useEditableItem: editableItemHook = () => {
  const [editing, setEditing] = useState(false);

  const onEnterEditMode = () => {
    setEditing(true);
  };
  const onExitEditMode = (
    originalValue: string,
    editedValue: string,
    allowDeactivation: boolean,
    tabIndex: number
  ) => {
    setEditing(false);
  };

  const onKeyDown = (evt: KeyboardEvent, tabIndex: number) => {
    const target = evt.target as HTMLElement;
    if (isEditKey(evt.key) && isEditableElement(target)) {
      setEditing(true);
    }
  };

  return {
    editing,
    onKeyDown,
    onEnterEditMode,
    onExitEditMode,
    setEditing,
  };
};
