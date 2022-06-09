import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONObj } from "../helpers/parseToJson";
import { InnerFieldLabel } from "./labels/InnerFieldLabel";
import { ValueEditor } from "./editor/ValueEditor";
import { TokenWithColors } from "./TokenWithColors";
import "./ChildrenValues.css";

const withBaseName = makePrefixer("uitkChildrenValues");

export const SECTIONED_BY_COLOR_STATE = ["foreground", "border", "outline"];

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

export const ChildrenValuesWithinSection = ({
  uitkColorOverrides,
  characteristicsView,
  children,
  extractValue,
  fieldName,
  onUpdateJSON,
  patternName,
  scope,
}: ChildrenValuesProps) => {
  return (
    <div className={cn(withBaseName("section"))}>
      <InnerFieldLabel
        fieldName={fieldName}
        patternName={patternName}
        remainingJSON={children}
      />
      {Object.keys(children)
        .sort((k1, k2) => (k1 === "value" ? -1 : 1))
        .map((node) =>
          node !== "value" ? (
            <ChildrenValues
              uitkColorOverrides={uitkColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              children={children[node]}
              fieldName={`${fieldName}-${node}`}
              key={`${patternName}-${fieldName}-${node}`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
              inSection={true}
            />
          ) : (
            <ValueEditor
              uitkColorOverrides={uitkColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              key={`${patternName}-${fieldName}-${node}-editor`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
              value={children.value!}
              valueName={"Default"}
            />
          )
        )}
    </div>
  );
};

export const ChildrenValues = (props: ChildrenValuesProps): ReactElement => {
  return (
    <div className={cn(withBaseName())}>
      {!!Object.keys(props.children).filter((node) =>
        Object.keys(props.children[node]).includes("value")
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
      {!Object.keys(props.children).filter((node) =>
        Object.keys(props.children[node]).includes("value")
      ).length &&
        Object.keys(props.children)
          .filter(
            (node) => !Object.keys(props.children[node]).includes("value")
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
          )}
    </div>
  );
};
