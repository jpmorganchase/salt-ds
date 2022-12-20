import { ReactElement } from "react";
import cn from "classnames";
import {
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
} from "@salt-ds/lab";
import { makePrefixer } from "@salt-ds/core";
import { ChildrenValues } from "../../ChildrenValues";
import { JSONObj } from "../../../helpers/parseToJson";
import "../Foundations.css";

const withBaseName = makePrefixer("saltFoundationPattern");

export interface FoundationPatternByDensityProps {
  saltColorOverrides?: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  values: JSONObj;
}

function getScopeName(scope: string): string {
  switch (scope) {
    case "density-touch":
      return "TD";
    case "density-low":
      return "LD";
    case "density-high":
      return "HD";
    case "density-medium":
      return "MD";
    case "density-all":
      return "All densities";
    case "emphasis-low-light" || "emphasis-low-dark":
      return "Low emphasis";
    case "emphasis-high-light" || "emphasis-high-dark":
      return "High emphasis";
    default:
      return scope;
  }
}

export const FoundationPatternByDensity = (
  props: FoundationPatternByDensityProps
): ReactElement => {
  return (
    <AccordionSection key={`${props.themeName}-${props.patternName}-accordion`}>
      <AccordionSummary>{getScopeName(props.scope)}</AccordionSummary>
      <AccordionDetails>
        <div className={cn(withBaseName())}>
          {props.values &&
            Object.keys(props.values).map(function (node) {
              const [values, fieldName] =
                node === "value"
                  ? [props.values, props.patternName]
                  : [props.values[node], node];

              return (
                <ChildrenValues
                  saltColorOverrides={props.saltColorOverrides}
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
        </div>
      </AccordionDetails>
    </AccordionSection>
  );
};
