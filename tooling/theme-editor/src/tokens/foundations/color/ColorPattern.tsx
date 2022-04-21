import { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AccordionSection,
  AccordionDetails,
  AccordionSummary,
  capitalize,
} from "@jpmorganchase/lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { ChildrenValues } from "../../ChildrenValues";
export interface ColorPatternProps {
  uitkColorOverrides?: Record<string, string>;
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
    <AccordionSection
      expanded={expandedSections.includes(props.patternName)}
      key={`${props.themeName}-${props.patternName}-accordion`}
      onChange={(isExpanded) => {
        let colors;
        if (isExpanded) {
          const openColors = searchParams.get("open");
          colors = props.patternName;
          if (openColors) {
            colors = [colors, openColors].join("&");
          }
        } else {
          const colorsOpen = searchParams.get("open")?.split("&");
          if (colorsOpen) {
            colors = colorsOpen
              .filter((color) => color !== props.patternName)
              .join("&");
          }
        }
        colors ? setSearchParams({ open: colors }) : setSearchParams({});
      }}
    >
      <AccordionSummary>
        {capitalize(props.patternName) as string}
      </AccordionSummary>
      <AccordionDetails>
        {props.values &&
          Object.keys(props.values).map(function (node) {
            const [values, fieldName] =
              node === "value"
                ? [props.values, props.patternName]
                : [props.values[node], node];

            return (
              <ChildrenValues
                uitkColorOverrides={props.uitkColorOverrides}
                children={values}
                extractValue={props.extractValue}
                fieldName={fieldName}
                key={`${props.themeName}-${props.patternName}${node}`}
                onUpdateJSON={props.onUpdateJSON}
                patternName={props.patternName}
                scope={props.scope}
              />
            );
          })}
      </AccordionDetails>
    </AccordionSection>
  );
};
