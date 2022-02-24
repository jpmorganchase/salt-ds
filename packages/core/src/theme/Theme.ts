export type characteristic =
  | "actionable"
  | "container"
  | "disabled"
  | "editable"
  | "focused"
  | "icon"
  | "navigable"
  | "overlayable"
  | "progress"
  | "selectable"
  | "separator"
  | "status"
  | "shadow"
  | "size"
  | "spacing"
  | "text";
export class Theme {
  id: string;
  name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  getCharacteristicValue(
    characteristicName: characteristic,
    variant: string,
    scopeElement?: HTMLElement
  ): string | null {
    const cssVariableName = `--uitk-${characteristicName}-${variant}`;
    const scopeTarget =
      scopeElement || document.body.querySelector(`.uitk-${this.id}`);
    if (scopeTarget) {
      const style = getComputedStyle(scopeTarget);
      const variableValue = style.getPropertyValue(cssVariableName);
      if (variableValue) {
        return variableValue;
      }
    }
    return null;
  }
}

const lightTheme = new Theme("uitk-light", "light");
const darkTheme = new Theme("uitk-dark", "dark");

const toolkitThemes: Map<string, Theme> = new Map([
  ["light", lightTheme],
  ["dark", darkTheme],
]);

export const DEFAULT_THEME = lightTheme;

export const getTheme = (themeName: string | string[]): Theme[] => {
  if (typeof themeName === "string") {
    if (!toolkitThemes.has(themeName)) {
      toolkitThemes.set(themeName, new Theme(themeName, themeName));
    }
    return [toolkitThemes.get(themeName) as Theme];
  } else if (Array.isArray(themeName) && themeName.length > 0) {
    return themeName.flatMap(getTheme);
  } else {
    return [DEFAULT_THEME];
  }
};
