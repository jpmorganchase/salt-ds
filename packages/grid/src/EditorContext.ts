import { createContext, useContext } from "react";

export interface EditorContext {
  editorText: string;
  editMode?: boolean;
  startEditMode: (value?: string) => void;
  endEditMode: (value: string) => void;
  setEditorText: (value: string) => void;
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
