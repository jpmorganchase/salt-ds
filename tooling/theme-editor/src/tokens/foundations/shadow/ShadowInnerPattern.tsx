import { ReactElement } from "react";
import { JSONObj } from "../../../helpers/parseToJson";
import { ValueEditor } from "../../editor/ValueEditor";

interface ShadowInnerPatternProps {
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
  const onUpdateJSON = (value: string, pathToUpdate: string, scope: string) => {
    let editedValue = "";
    let shadowParts: string[] = [];
    if (props.entireValue.includes("rgba")) {
      const shadowPartsAndColor = props.entireValue.split("rgba");
      shadowParts = (
        shadowPartsAndColor[0] +
        "rgba" +
        shadowPartsAndColor[1].replaceAll(" ", "")
      ).split(" ");
    } else if (props.entireValue.includes("rgb")) {
      const shadowPartsAndColor = props.entireValue.split("rgb");
      shadowParts = (
        shadowPartsAndColor[0] +
        "rgb" +
        shadowPartsAndColor[1].replaceAll(" ", "")
      ).split(" ");
    } else {
      shadowParts = props.entireValue.split(" ");
    }

    if (shadowParts.length === 5) {
      switch (props.label) {
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
      props.onUpdateJSON(editedValue, props.patternName, scope);
    }
  };

  return (
    <ValueEditor
      uitkColorOverrides={props.saltColorOverrides}
      extractValue={props.extractValue}
      characteristicsView={false}
      key={`${props.patternName}-editor`}
      onUpdateJSON={onUpdateJSON}
      patternName={props.patternName}
      scope={props.scope}
      value={props.value}
      valueName={props.label}
    />
  );
};
