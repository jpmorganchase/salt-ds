import { JSONByScope } from "@jpmorganchase/uitk-/theme-editor";
import { Dispatch, useState, useRef, useEffect } from "react";
import { Action, ActionType } from "./Action";

export const useTheme = (initialTheme: {
  themeName: string;
  jsonByScope: JSONByScope[];
}): readonly [
  { themeName: string; jsonByScope: JSONByScope[] },
  (
    theme: { themeName: string; jsonByScope: JSONByScope[] },
    dispatch: Dispatch<Action>
  ) => void
] => {
  const [currentTheme, setTheme] =
    useState<{ themeName: string; jsonByScope: JSONByScope[] }>(initialTheme);

  const dispatchRef = useRef<Dispatch<Action> | null>(null);

  const setThemeWithCallback = (
    theme: { themeName: string; jsonByScope: JSONByScope[] },
    dispatch: Dispatch<Action>
  ) => {
    setTheme(theme);
    dispatchRef.current = dispatch;
  };

  useEffect(() => {
    dispatchRef.current?.({
      type: ActionType.UPLOAD,
      payload: currentTheme.jsonByScope,
    });
  }, [currentTheme]);

  return [currentTheme, setThemeWithCallback] as const;
};
