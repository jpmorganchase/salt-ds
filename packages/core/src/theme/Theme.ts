export type characteristic =
  | "accent"
  | "actionable"
  | "container"
  | "delay"
  | "disabled"
  | "draggable"
  | "target"
  | "editable"
  | "focused"
  | "measured"
  | "navigable"
  | "overlayable"
  | "selectable"
  | "separable"
  | "taggable"
  | "text"
  | "status"
  // The next 4 are foundations, should they really be here?
  | "icon"
  | "shadow"
  | "size"
  | "spacing";

export type ThemeName = string;

export const getCharacteristicValue = (
  themeName: ThemeName,
  characteristicName: characteristic,
  variant: string,
  scopeElement?: HTMLElement
): string | null => {
  const cssVariableName = `--salt-${characteristicName}-${variant}`;
  const scopeTarget =
    scopeElement || document.body.querySelector(`.${themeName}`);
  if (scopeTarget) {
    const style = getComputedStyle(scopeTarget);
    const variableValue = style.getPropertyValue(cssVariableName);
    if (variableValue) {
      return variableValue;
    }
  }
  return null;
};
