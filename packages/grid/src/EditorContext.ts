import { createContext, useContext } from "react";

export interface EditorContext {
  initialText?: string;
  editMode?: boolean;
  startEditMode: () => void;
  endEditMode: (value: string) => void;
  cancelEditMode: () => void;
}

export const EditorContext = createContext<EditorContext | undefined>(
  undefined
);
export const useEditorContext = () => {
  const c = useContext(EditorContext);
  if (!c) {
    throw new Error(`useEditorContext invoked outside of a Grid`);
  }
  return c;
};
