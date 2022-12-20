export type characteristic =
  | "accent"
  | "actionable"
  | "container"
  | "differential"
  | "draggable"
  | "editable"
  | "focused"
  | "measured"
  | "navigable"
  | "overlayable"
  | "selectable"
  | "separable"
  | "status"
  | "taggable"
  | "target"
  | "text";

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
