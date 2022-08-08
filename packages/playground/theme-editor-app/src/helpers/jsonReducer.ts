import { JSONByScope, JSONObj } from "@jpmorganchase/theme-editor";
import { Reducer } from "react";
import { Action, ActionType } from "./Action";

export const jsonReducer: Reducer<JSONByScope[], Action> = (
  state: JSONByScope[],
  action: Action
) => {
  if (action.type === ActionType.UPLOAD || action.type === ActionType.REPLACE) {
    return action.payload.sort((a, b) => (a.scope < b.scope ? 1 : -1));
  }

  if (action.type === ActionType.UPDATE) {
    let updated = state;
    state
      .filter((element) => element.scope === action.payload.scope)
      .forEach((s) => {
        if (s.jsonObj.uitk.hasOwnProperty(action.payload.patternName)) {
          const replaceScope = {
            ...s,
            jsonObj: {
              uitk: replaceJSONPaths(
                s.jsonObj.uitk,
                action.payload.newValue,
                action.payload.pathToUpdate,
                0
              ),
            },
          };

          const newJsonByScope = state.filter((element) => {
            return element.scope !== s.scope;
          });
          newJsonByScope.push(replaceScope);
          const current = newJsonByScope.sort((a, b) =>
            a.scope < b.scope ? 1 : -1
          );
          updated = current;
        }
      });

    return updated;
  }

  return state;
};

const replaceJSONPaths = (
  jsonObj: JSONObj,
  newVal: string,
  pathToUpdate: string,
  positionInPath: number
): JSONObj => {
  const newJSON = {};

  Object.keys(jsonObj).forEach((path) => {
    if (pathToUpdate?.split("-")[positionInPath] === path) {
      if (pathToUpdate?.split("-").length - 1 === positionInPath) {
        return Object.assign(newJSON, {
          [path]: { ...jsonObj[path], value: newVal },
        });
      }
      return Object.assign(newJSON, {
        [path]: replaceJSONPaths(
          jsonObj[path],
          newVal,
          pathToUpdate,
          ++positionInPath
        ),
      });
    } else return Object.assign(newJSON, { [path]: jsonObj[path] });
  });

  return newJSON;
};
