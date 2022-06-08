import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChildrenValues } from "../../ChildrenValues";
import { JSONObj } from "../../../helpers/parseToJson";
import "./ZIndexPattern.css";

const withBaseName = makePrefixer("uitkZIndexPattern");

export interface ZIndexPatternProps {
  uitkColorOverrides?: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  values: JSONObj;
}

export const ZIndexPattern = (props: ZIndexPatternProps): ReactElement => {
  return (
    <div className={cn(withBaseName())}>
      <div className={cn(withBaseName("label"))}>Z-Index</div>
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
  );
};
