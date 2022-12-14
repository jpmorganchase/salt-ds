import { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AccordionSection,
  AccordionDetails,
  AccordionSummary,
  capitalize,
} from "@salt-ds/lab";
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
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const openSections = searchParams.get("open")?.split("&") || [];
    setExpandedSections(openSections);
  }, [searchParams]);

  return (
    <>
      {Object.keys(props.values).map(function (color) {
        return (
          <AccordionSection
            expanded={expandedSections.includes(color)}
            key={`${props.themeName}-${props.patternName}-${color}-accordion`}
            onChange={(isExpanded) => {
              let colors;
              if (isExpanded) {
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
            <AccordionSummary>{capitalize(color) as string}</AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </AccordionSection>
        );
      })}
    </>
  );
};
{
}
