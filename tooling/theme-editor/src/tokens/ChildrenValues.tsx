import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONObj } from "../helpers/parseToJson";
import { InnerFieldLabel } from "./labels/InnerFieldLabel";
import { UITK_COLOURS } from "../utils/uitkValues";
import { ValueEditor } from "./editor/ValueEditor";
import "./ChildrenValues.css";

const withBaseName = makePrefixer("uitkChildrenValues");
interface ChildrenValuesProps {
  uitkColorOverrides?: Record<string, string>;
  characteristicsView?: boolean;
  children: JSONObj;
  extractValue: (value: string) => string;
  fieldName: string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
}

const ChildrenValuesWithinSection = (props: ChildrenValuesProps) => {
  return (
    <div className={cn(withBaseName())}>
      {Object.keys(props.children)
        .filter((node) => Object.keys(props.children[node]).includes("value"))
        .map((node) => (
          <ChildrenValues
            uitkColorOverrides={props.uitkColorOverrides}
            extractValue={props.extractValue}
            characteristicsView={props.characteristicsView}
            children={props.children[node]}
            fieldName={`${props.fieldName}-${node}`}
            key={`${props.patternName}-${props.fieldName}-${node}`}
            onUpdateJSON={props.onUpdateJSON}
            patternName={props.patternName}
            scope={props.scope}
          />
        ))}
    </div>
  );
};

export const ChildrenValues = (props: ChildrenValuesProps): ReactElement => {
  return (
    <>
      {props.fieldName && (
        <InnerFieldLabel
          patternName={props.patternName}
          fieldName={props.fieldName}
          remainingJSON={props.children}
        />
      )}
      {props.children &&
        !!Object.keys(props.children).filter(
          (node) =>
            Object.keys(props.children[node]).includes("value") &&
            !UITK_COLOURS.includes(props.patternName)
        ).length && (
          <ChildrenValuesWithinSection
            characteristicsView={props.characteristicsView}
            children={props.children}
            uitkColorOverrides={props.uitkColorOverrides}
            extractValue={props.extractValue}
            fieldName={props.fieldName}
            onUpdateJSON={props.onUpdateJSON}
            patternName={props.patternName}
            scope={props.scope}
          />
        )}
      {props.children &&
        Object.keys(props.children)
          .filter(
            (node) =>
              !Object.keys(props.children[node]).includes("value") ||
              (Object.keys(props.children[node]).includes("value") &&
                UITK_COLOURS.includes(props.patternName))
          )
          .sort((k1, k2) => (k1 === "value" ? -1 : 1))
          .map((node) =>
            node !== "value" ? (
              <ChildrenValues
                uitkColorOverrides={props.uitkColorOverrides}
                extractValue={props.extractValue}
                characteristicsView={props.characteristicsView}
                children={props.children[node]}
                fieldName={`${props.fieldName}-${node}`}
                key={`${props.patternName}-${props.fieldName}-${node}`}
                onUpdateJSON={props.onUpdateJSON}
                patternName={props.patternName}
                scope={props.scope}
              />
            ) : (
              props.children.value && (
                <ValueEditor
                  uitkColorOverrides={props.uitkColorOverrides}
                  extractValue={props.extractValue}
                  characteristicsView={props.characteristicsView}
                  key={`${props.patternName}-${props.fieldName}-${node}-editor`}
                  onUpdateJSON={props.onUpdateJSON}
                  patternName={props.patternName}
                  scope={props.scope}
                  value={props.children.value}
                  valueName={props.fieldName}
                />
              )
            )
          )}
    </>
  );
};
