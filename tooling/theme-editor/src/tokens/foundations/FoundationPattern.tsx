import { ReactElement } from "react";
import cn from "classnames";
import {
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
} from "@jpmorganchase/lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChildrenValues } from "../ChildrenValues";
import { JSONObj } from "../../helpers/parseToJson";
import "./Foundations.css";

const withBaseName = makePrefixer("uitkFoundationPattern");
export interface FoundationPatternProps {
  uitkColorOverrides?: Record<string, string>;
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
    default:
      return scope;
  }
}

export const FoundationPattern = (
  props: FoundationPatternProps
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
        </div>
      </AccordionDetails>
    </AccordionSection>
  );
};
