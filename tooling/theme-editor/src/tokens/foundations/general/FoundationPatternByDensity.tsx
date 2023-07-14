import { ReactElement } from "react";
import { clsx } from "clsx";
import { Accordion, AccordionHeader, AccordionPanel } from "@salt-ds/lab";
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
    <Accordion
      value={props.patternName}
      key={`${props.themeName}-${props.patternName}-accordion`}
    >
      <AccordionHeader>{getScopeName(props.scope)}</AccordionHeader>
      <AccordionPanel>
        <div className={clsx(withBaseName())}>
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
      </AccordionPanel>
    </Accordion>
  );
};
