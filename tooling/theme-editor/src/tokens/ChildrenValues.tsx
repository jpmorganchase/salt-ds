import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import { JSONObj } from "../helpers/parseToJson";
import { InnerFieldLabel } from "./labels/InnerFieldLabel";
import { UITK_COLOURS } from "../utils/uitkValues";
import { ValueEditor } from "./editor/ValueEditor";
import "./ChildrenValues.css";
import { ColorTokensByState } from "./foundations/color/ColorTokensByState";

const withBaseName = makePrefixer("uitkChildrenValues");

const SECTIONED_BY_STATE = ["text", "icon", "border"];
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
        .filter(
          (node) =>
            Object.keys(props.children[node]).includes("value") ||
            SECTIONED_BY_STATE.some((token) => token === node)
        )
        .map((node) =>
          node === "background" ? (
            <>
              <ColorTokensByState
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
            </>
          ) : SECTIONED_BY_STATE.some((token) => token === node) ? (
            <>
              {props.children[node].color && (
                <ColorTokensByState
                  uitkColorOverrides={props.uitkColorOverrides}
                  extractValue={props.extractValue}
                  characteristicsView={props.characteristicsView}
                  children={props.children[node].color}
                  fieldName={`${props.fieldName}-${node}-color`}
                  key={`${props.patternName}-${props.fieldName}-${node}`}
                  onUpdateJSON={props.onUpdateJSON}
                  patternName={props.patternName}
                  scope={props.scope}
                />
              )}
              {Object.keys(props.children[node])
                .filter((childNode) => childNode !== "color")
                .map((childNode) => (
                  <ChildrenValues
                    uitkColorOverrides={props.uitkColorOverrides}
                    extractValue={props.extractValue}
                    characteristicsView={props.characteristicsView}
                    children={props.children[node][childNode]}
                    fieldName={`${props.fieldName}-${node}-${childNode}`}
                    key={`${props.patternName}-${props.fieldName}-${node}-${childNode}`}
                    onUpdateJSON={props.onUpdateJSON}
                    patternName={props.patternName}
                    scope={props.scope}
                  />
                ))}
            </>
          ) : (
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
          )
        )}
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
            (Object.keys(props.children[node]).includes("value") &&
              !UITK_COLOURS.includes(props.patternName)) ||
            SECTIONED_BY_STATE.some((token) => token === node)
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
              (!Object.keys(props.children[node]).includes("value") ||
                (Object.keys(props.children[node]).includes("value") &&
                  UITK_COLOURS.includes(props.patternName))) &&
              !SECTIONED_BY_STATE.some((token) => token === node)
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
                value={props.children.value!}
                valueName={props.fieldName}
              />
            )
          )}
    </>
  );
};
