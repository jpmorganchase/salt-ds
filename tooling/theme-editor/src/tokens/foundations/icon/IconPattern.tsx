import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import { ChildrenValues } from "../../ChildrenValues";
import { JSONObj } from "../../../helpers/parseToJson";
import "./IconPattern.css";

const withBaseName = makePrefixer("uitkIconPattern");

export interface IconPatternProps {
  uitkColorOverrides?: Record<string, string>;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  values: JSONObj;
}

export const IconPattern = (props: IconPatternProps): ReactElement => {
  return (
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
  );
};
