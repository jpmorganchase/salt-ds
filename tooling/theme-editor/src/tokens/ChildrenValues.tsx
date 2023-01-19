import { ReactElement } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { JSONObj } from "../helpers/parseToJson";
import { InnerFieldLabel } from "./labels/InnerFieldLabel";
import { ValueEditor } from "./editor/ValueEditor";
import { TokenWithColors } from "./TokenWithColors";
import "./ChildrenValues.css";

const withBaseName = makePrefixer("saltChildrenValues");

export const SECTIONED_BY_COLOR_STATE = ["text", "icon", "border", "outline"];
interface ChildrenValuesProps {
  saltColorOverrides?: Record<string, string>;
  characteristicsView?: boolean;
  children: JSONObj;
  extractValue: (value: string) => string;
  fieldName: string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
}

export const ChildrenValuesWithinSection = ({
  saltColorOverrides,
  characteristicsView,
  children,
  extractValue,
  fieldName,
  onUpdateJSON,
  patternName,
  scope,
}: ChildrenValuesProps) => {
  return (
    <div className={clsx(withBaseName())}>
      <InnerFieldLabel
        isEmphasis={Object.keys(children).includes("emphasis")}
        fieldName={fieldName}
        patternName={patternName}
        remainingJSON={children}
      />
      {Object.keys(children)
        .filter(
          (node) =>
            Object.keys(children[node]).includes("value") ||
            SECTIONED_BY_COLOR_STATE.some((token) => token === node)
        )
        .sort((k1, k2) => (k1 === "value" ? -1 : 1))
        .map((node) =>
          node === "background" || node === "color" || children[node].color ? (
            <TokenWithColors
              children={children}
              extractValue={extractValue}
              fieldName={fieldName}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
              node={node}
            />
          ) : (
            <ChildrenValues
              saltColorOverrides={saltColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              children={children[node]}
              fieldName={`${fieldName}-${node}`}
              key={`${patternName}-${fieldName}-${node}`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
            />
          )
        )}
      {Object.keys(children)
        .filter(
          (node) =>
            !Object.keys(children[node]).includes("value") &&
            !SECTIONED_BY_COLOR_STATE.some((token) => token === node)
        )
        .sort((k1, k2) => (k1 === "value" ? -1 : 1))
        .map((node) =>
          node !== "value" ? (
            <ChildrenValues
              saltColorOverrides={saltColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              children={children[node]}
              fieldName={`${fieldName}-${node}`}
              key={`${patternName}-${fieldName}-${node}`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
            />
          ) : (
            <ValueEditor
              saltColorOverrides={saltColorOverrides}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              key={`${patternName}-${fieldName}-${node}-editor`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
              value={children.value!}
              valueName={fieldName}
            />
          )
        )}
    </div>
  );
};

export const ChildrenValues = (props: ChildrenValuesProps): ReactElement => {
  return (
    <>
      {props.children &&
        !!Object.keys(props.children).filter(
          (node) =>
            Object.keys(props.children[node]).includes("value") ||
            SECTIONED_BY_COLOR_STATE.some((token) => token === node)
        ).length && (
          <ChildrenValuesWithinSection
            characteristicsView={props.characteristicsView}
            children={props.children}
            saltColorOverrides={props.saltColorOverrides}
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
              !Object.keys(props.children[node]).includes("value") &&
              !SECTIONED_BY_COLOR_STATE.some((token) => token === node)
          )
          .sort((k1, k2) => (k1 === "value" ? -1 : 1))
          .map((node) =>
            node !== "value" ? (
              <ChildrenValues
                saltColorOverrides={props.saltColorOverrides}
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
                saltColorOverrides={props.saltColorOverrides}
                extractValue={props.extractValue}
                characteristicsView={props.characteristicsView}
                key={`${props.patternName}-${props.fieldName}-${node}-editor`}
                onUpdateJSON={props.onUpdateJSON}
                patternName={props.patternName}
                scope={props.scope}
                value={props.children.value!}
                valueName={props.fieldName}
              />
            )
          )}
    </>
  );
};
