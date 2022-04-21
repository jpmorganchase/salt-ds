import { JSONByScope } from "@jpmorganchase/uitk-/theme-editor";

export enum ActionType {
  UPDATE = "UPDATE",
  UPLOAD = "UPLOAD",
  REPLACE = "REPLACE",
}

interface UpdateAction {
  type: ActionType.UPDATE;
  payload: {
    patternName: string;
    newValue: string;
    pathToUpdate: string;
    scope: string;
  };
}

interface UploadAction {
  type: ActionType.UPLOAD;
  payload: JSONByScope[];
}

interface ReplaceAction {
  type: ActionType.REPLACE;
  payload: JSONByScope[];
}

export type Action = UpdateAction | UploadAction | ReplaceAction;
