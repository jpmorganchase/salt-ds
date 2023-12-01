export type characteristic =
  | "accent"
  | "actionable"
  | "container"
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
  | "text"
  | "differential" /* **deprecated** */;

export type ThemeName = string | string[];

const getThemeQuerySelector = (themeName: ThemeName) => {
  if (typeof themeName === "string") {
    return `.${themeName}`;
  } else {
    return themeName.map((t) => "." + t).join();
  }
};

export const getCharacteristicValue = (
  themeName: ThemeName,
  characteristicName: characteristic,
  variant: string,
  scopeElement?: HTMLElement
): string | null => {
  const cssVariableName = `--salt-${characteristicName}-${variant}`;
  const scopeTarget =
    scopeElement ??
    document.body.querySelector(getThemeQuerySelector(themeName));
  if (scopeTarget) {
    const style = getComputedStyle(scopeTarget);
    const variableValue = style.getPropertyValue(cssVariableName);
    if (variableValue) {
      return variableValue;
    }
  }
  return null;
};
