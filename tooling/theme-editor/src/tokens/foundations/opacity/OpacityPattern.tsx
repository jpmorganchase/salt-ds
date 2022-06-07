import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONObj } from "../../../helpers/parseToJson";
import "./OpacityPattern.css";
import { ValueEditor } from "../../editor/ValueEditor";
import { capitalize } from "@jpmorganchase/uitk-lab";

const withBaseName = makePrefixer("uitkOpacityPattern");

export interface OpacityPatternProps {
  uitkColorOverrides?: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  values: JSONObj;
}

export const OpacityPattern = (props: OpacityPatternProps): ReactElement => {
  return (
    <div className={cn(withBaseName())}>
      <div className={cn(withBaseName("label"))}>
        {props.scope === "mode-all" ? "All" : capitalize(props.scope)}
      </div>
      {props.values &&
        Object.keys(props.values).map(function (node) {
          if (
            Object.keys(props.values[node]).length === 1 &&
            props.values[node].value
          ) {
            return (
              <ValueEditor
                uitkColorOverrides={props.uitkColorOverrides}
                extractValue={props.extractValue}
                key={`${props.patternName}-${node}-editor`}
                onUpdateJSON={props.onUpdateJSON}
                patternName={props.patternName}
                scope={props.scope}
                value={props.values[node].value!}
                valueName={node}
              />
            );
          } else {
            return Object.keys(props.values[node]).map(function (innerNode) {
              const value =
                innerNode === "value"
                  ? props.values[node][innerNode]
                  : props.values[node][innerNode].value;
              return (
                <ValueEditor
                  uitkColorOverrides={props.uitkColorOverrides}
                  extractValue={props.extractValue}
                  key={`${props.patternName}-${node}-${innerNode}-editor`}
                  onUpdateJSON={props.onUpdateJSON}
                  patternName={props.patternName}
                  scope={props.scope}
                  value={value!}
                  valueName={`${node}${
                    innerNode !== "value" ? ` ${innerNode}` : ``
                  }`}
                />
              );
            });
          }
        })}
    </div>
  );
};
