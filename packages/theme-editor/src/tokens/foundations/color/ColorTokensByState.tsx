import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@uitk/toolkit";
import { JSONObj } from "../../../helpers/parseToJson";
import { ValueEditor } from "../../editor/ValueEditor";
import { InnerFieldLabel } from "../../labels/InnerFieldLabel";
import "./ColorTokensByState.css";

const withBaseName = makePrefixer("uitkColorTokenByStateValues");

interface ColorTokensByStateProps {
  uitkColorOverrides?: Record<string, string>;
  characteristicsView?: boolean;
  children: JSONObj;
  extractValue: (value: string) => string;
  fieldName: string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
}

const TokenStateValue = (props: ColorTokensByStateProps) => {
  return (
    <>
      {Object.keys(props.children).map((node) =>
        node === "value" ? (
          props.children.value && (
            <ValueEditor
              isStateValue={true}
              extractValue={props.extractValue}
              characteristicsView={props.characteristicsView}
              key={`${props.patternName}-${props.fieldName}-${node}-editor`}
              onUpdateJSON={props.onUpdateJSON}
              patternName={props.patternName}
              scope={props.scope}
              uitkColorOverrides={props.uitkColorOverrides}
              value={props.children.value}
              valueName={props.fieldName}
            />
          )
        ) : (
          <TokenStateValue
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
    </>
  );
};

export const ColorTokensByState = (
  props: ColorTokensByStateProps
): ReactElement => {
  return (
    <div className={withBaseName()}>
      {props.fieldName && (
        <InnerFieldLabel
          patternName={props.patternName}
          fieldName={props.fieldName.replace("-color", "")}
          remainingJSON={props.children}
          size={"medium"}
        />
      )}
      <div className={withBaseName("container")}>
        {Object.keys(props.children)
          .sort((a, b) => (a < b ? -1 : 1))
          .map((node) =>
            node === "value" ? (
              props.children.value && (
                <ValueEditor
                  isStateValue={true}
                  extractValue={props.extractValue}
                  characteristicsView={props.characteristicsView}
                  key={`${props.patternName}-${props.fieldName}-${node}-editor`}
                  onUpdateJSON={props.onUpdateJSON}
                  patternName={props.patternName}
                  scope={props.scope}
                  uitkColorOverrides={props.uitkColorOverrides}
                  value={props.children.value}
                  valueName={props.fieldName}
                />
              )
            ) : (
              <TokenStateValue
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
    </div>
  );
};
