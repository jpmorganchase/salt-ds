import { ReactElement } from "react";
import { JSONObj } from "../../../helpers/parseToJson";
import { ValueEditor } from "../../editor/ValueEditor";

interface ShadowInnerPatternProps {
  className?: string;
  patternName: string;
  entireValue: string;
  uitkColorOverrides: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  scope: string;
  themeName: string;
  values: JSONObj;
  label: string;
  value: string;
}

export const ShadowInnerPattern = (
  props: ShadowInnerPatternProps
): ReactElement => {
  const {
    className,
    patternName,
    entireValue,
    uitkColorOverrides,
    extractValue,
    onUpdateJSON,
    scope,
    themeName,
    values,
    label,
    value,
  } = props;

  const updateJson = (value: string, pathToUpdate: string, scope: string) => {
    let editedValue = "";
    let shadowParts: string[] = [];
    if (entireValue.includes("rgba")) {
      const shadowPartsAndColor = entireValue.split("rgba");
      shadowParts = (
        shadowPartsAndColor[0] +
        "rgba" +
        shadowPartsAndColor[1].replaceAll(" ", "")
      ).split(" ");
    } else if (entireValue.includes("rgb")) {
      const shadowPartsAndColor = entireValue.split("rgb");
      shadowParts = (
        shadowPartsAndColor[0] +
        "rgb" +
        shadowPartsAndColor[1].replaceAll(" ", "")
      ).split(" ");
    } else {
      shadowParts = entireValue.split(" ");
    }

    if (shadowParts.length === 5) {
      switch (label) {
        case "X":
          shadowParts.splice(0, 1, value);
          break;
        case "Y":
          shadowParts.splice(1, 1, value);
          break;
        case "Blur":
          shadowParts.splice(2, 1, value);
          break;
        case "Spread":
          shadowParts.splice(3, 1, value);
          break;
        case "Color":
          shadowParts.splice(4, 1, value);
          break;
      }
      editedValue = shadowParts.join(" ");
      onUpdateJSON(editedValue, patternName, scope);
    }
  };

  return (
    <ValueEditor
      className={className}
      uitkColorOverrides={uitkColorOverrides}
      extractValue={extractValue}
      characteristicsView={false}
      key={`${patternName}-editor`}
      onUpdateJSON={updateJson}
      patternName={patternName}
      scope={scope}
      value={value}
      valueName={label}
    />
  );
};
