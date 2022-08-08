import { useControlled } from "@jpmorganchase/uitk-core";
import { useCallback, KeyboardEvent } from "react";
import { OverflowItem } from "../responsive";

const editKeys = new Set(["Enter", " "]);
const isEditKey = (key: string) => editKeys.has(key);

export type ExitEditModeHandler = (
  originalValue: string,
  editedValue: string,
  allowDeactivation: boolean,
  tabIndex: number
) => void;

export interface Editable {
  editing: boolean;
  onEnterEditMode: () => void;
  onExitEditMode: ExitEditModeHandler;
  setEditing: (value: boolean) => void;
}
interface EditableItemHookProps extends Partial<Editable> {
  highlightedIdx: number;
  indexPositions: OverflowItem[];
}

interface EditableItemHookResult extends Editable {
  onKeyDown: (evt: KeyboardEvent) => void;
}

export const useEditableItem = ({
  editing: editingProp,
  highlightedIdx,
  indexPositions,
  onEnterEditMode: onEnterEditModeProp,
  onExitEditMode: onExitEditModeProp,
}: EditableItemHookProps): EditableItemHookResult => {
  const [editing, setEditing] = useControlled({
    controlled: editingProp,
    default: false,
    name: "useEditableItem",
    state: "editing",
  });

  const onEnterEditMode = useCallback(() => {
    setEditing(true);
    onEnterEditModeProp?.();
  }, [onEnterEditModeProp, setEditing]);

  const onExitEditMode = (
    originalValue: string,
    editedValue: string,
    allowDeactivation: boolean,
    tabIndex: number
  ) => {
    setEditing(false);
    console.log("exit edit mode");
    onExitEditModeProp?.(
      originalValue,
      editedValue,
      allowDeactivation,
      tabIndex
    );
  };

  const onKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      console.log(`useEditableItem onKeyDown ${highlightedIdx}`, {
        editable: indexPositions[highlightedIdx]?.editable,
      });
      if (isEditKey(evt.key) && indexPositions[highlightedIdx]?.editable) {
        onEnterEditMode();
      }
    },
    [onEnterEditMode, highlightedIdx, indexPositions]
  );

  return {
    editing,
    onKeyDown,
    // careful what do we use these for ?
    onEnterEditMode,
    onExitEditMode,
    setEditing,
  };
};
