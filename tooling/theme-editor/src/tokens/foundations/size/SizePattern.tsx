import { ReactElement } from "react";
import cn from "classnames";
import {
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
} from "@jpmorganchase/uitk-lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONObj } from "../../../helpers/parseToJson";
import { ValueEditor } from "../../editor/ValueEditor";
import { InnerFieldLabel } from "../../labels/InnerFieldLabel";

const withBaseName = makePrefixer("uitkSizePattern");

export interface SizePatternProps {
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
    case "emphasis-low-light" || "emphasis-low-dark":
      return "Low emphasis";
    case "emphasis-high-light" || "emphasis-high-dark":
      return "High emphasis";
    default:
      return scope;
  }
}

export const SizePattern = (props: SizePatternProps): ReactElement => {
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
                <>
                  {props.scope === "density-all" && (
                    <InnerFieldLabel
                      fieldName={fieldName}
                      patternName={props.patternName}
                      remainingJSON={values}
                    />
                  )}
                  {values.value && (
                    <ValueEditor
                      uitkColorOverrides={props.uitkColorOverrides}
                      extractValue={props.extractValue}
                      key={`${props.patternName}-${fieldName}-${fieldName}-editor`}
                      onUpdateJSON={props.onUpdateJSON}
                      patternName={props.patternName}
                      scope={props.scope}
                      value={values.value}
                      valueName={fieldName}
                    />
                  )}
                  {Object.keys(values).map(function (val) {
                    return (
                      values[val].value && (
                        <ValueEditor
                          uitkColorOverrides={props.uitkColorOverrides}
                          extractValue={props.extractValue}
                          key={`${props.patternName}-${fieldName}-${val}-editor`}
                          onUpdateJSON={props.onUpdateJSON}
                          patternName={props.patternName}
                          scope={props.scope}
                          value={values[val].value!}
                          valueName={val}
                        />
                      )
                    );
                  })}
                </>
              );
            })}
        </div>
      </AccordionDetails>
    </AccordionSection>
  );
};
