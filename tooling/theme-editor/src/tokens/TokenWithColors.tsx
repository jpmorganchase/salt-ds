import { JSONObj } from "..";
import { ChildrenValues } from "./ChildrenValues";
import { ColorTokensByState } from "./foundations/color/ColorTokensByState";

interface TokenWithColorsProps {
  saltColorOverrides?: Record<string, string>;
  characteristicsView?: boolean;
  children: JSONObj;
  extractValue: (value: string) => string;
  fieldName: string;
  node: string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
}

/**
Special view for tokens that have a color attribute -
 display all colors first by state, followed by remaining attrs
**/
export const TokenWithColors = ({
  saltColorOverrides,
  characteristicsView,
  children,
  extractValue,
  fieldName,
  onUpdateJSON,
  patternName,
  scope,
  node,
}: TokenWithColorsProps) => {
  return (
    <>
      <ColorTokensByState
        saltColorOverrides={saltColorOverrides}
        extractValue={extractValue}
        characteristicsView={characteristicsView}
        children={
          node === "background" || node === "color"
            ? children[node]
            : children[node].color
        }
        fieldName={`${fieldName}-${node}${
          !["background", "color"].includes(node) ? "-color" : ""
        }`}
        key={`${patternName}-${fieldName}-${node}${
          !["background", "color"].includes(node) ? "-color" : ""
        }`}
        onUpdateJSON={onUpdateJSON}
        patternName={patternName}
        scope={scope}
      />
      {children[node].color &&
        Object.keys(children[node])
          .filter((childNode) => childNode !== "color" && childNode !== "value")
          .map((childNode) => (
            <ChildrenValues
              saltColorOverrides={saltColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              children={children[node][childNode]}
              fieldName={`${fieldName}-${node}-${childNode}`}
              key={`${patternName}-${fieldName}-${node}-${childNode}`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
            />
          ))}
    </>
  );
};
