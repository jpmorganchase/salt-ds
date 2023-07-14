import { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { capitalize } from "@salt-ds/core";
import { Accordion, AccordionPanel, AccordionHeader } from "@salt-ds/lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { ChildrenValues } from "../../ChildrenValues";
export interface ColorPatternProps {
  saltColorOverrides?: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  values: JSONObj;
}

export const ColorPattern = (props: ColorPatternProps): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const expandedSections = searchParams.get("open")?.split("&") || [];

  return (
    <>
      {Object.keys(props.values).map(function (color) {
        return (
          <Accordion
            expanded={expandedSections.includes(color)}
            value={color}
            key={`${props.themeName}-${props.patternName}-${color}-accordion`}
            onToggle={() => {
              let colors;
              if (expandedSections.includes(color)) {
                const openColors = searchParams.get("open");
                colors = color;
                if (openColors) {
                  colors = [colors, openColors].join("&");
                }
              } else {
                const colorsOpen = searchParams.get("open")?.split("&");
                if (colorsOpen) {
                  colors = colorsOpen
                    .filter((openColor) => openColor !== color)
                    .join("&");
                }
              }
              colors ? setSearchParams({ open: colors }) : setSearchParams({});
            }}
          >
            <AccordionHeader>{capitalize(color) as string}</AccordionHeader>
            <AccordionPanel>
              {Object.keys(props.values[color]).map(function (node) {
                const [values, fieldName] =
                  node === "value"
                    ? [props.values[color], props.patternName]
                    : [props.values[color][node], node];

                return (
                  <ChildrenValues
                    saltColorOverrides={props.saltColorOverrides}
                    children={values}
                    extractValue={props.extractValue}
                    fieldName={fieldName}
                    key={`${props.themeName}-${props.patternName}-${color}-${node}`}
                    onUpdateJSON={props.onUpdateJSON}
                    patternName={props.patternName}
                    scope={props.scope}
                  />
                );
              })}
            </AccordionPanel>
          </Accordion>
        );
      })}
    </>
  );
};
{
}
