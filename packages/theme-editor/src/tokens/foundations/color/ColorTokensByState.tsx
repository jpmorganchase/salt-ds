import { ReactElement } from "react";
import { makePrefixer } from "@brandname/core";
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

const TokenStateValue = ({
  uitkColorOverrides,
  characteristicsView,
  children,
  extractValue,
  fieldName,
  onUpdateJSON,
  patternName,
  scope,
}: ColorTokensByStateProps): ReactElement => {
  return (
    <>
      {Object.keys(children).map((node) =>
        node === "value" ? (
          children.value && (
            <ValueEditor
              isStateValue={true}
              extractValue={extractValue}
              characteristicsView={characteristicsView}
              key={`${patternName}-${fieldName}-${node}-editor`}
              onUpdateJSON={onUpdateJSON}
              patternName={patternName}
              scope={scope}
              uitkColorOverrides={uitkColorOverrides}
              value={children.value}
              valueName={fieldName}
            />
          )
        ) : (
          <TokenStateValue
            uitkColorOverrides={uitkColorOverrides}
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
    </>
  );
};

export const ColorTokensByState = ({
  uitkColorOverrides,
  characteristicsView,
  children,
  extractValue,
  fieldName,
  onUpdateJSON,
  patternName,
  scope,
}: ColorTokensByStateProps): ReactElement => {
  return (
    <div className={withBaseName()}>
      {fieldName && (
        <InnerFieldLabel
          patternName={patternName}
          fieldName={fieldName.replace("-color", "")}
          remainingJSON={children}
          size={"medium"}
        />
      )}
      <div className={withBaseName("container")}>
        {Object.keys(children)
          .sort((a, b) => (a < b ? -1 : 1))
          .map((node) =>
            node === "value" ? (
              children.value && (
                <ValueEditor
                  isStateValue={true}
                  extractValue={extractValue}
                  characteristicsView={characteristicsView}
                  key={`${patternName}-${fieldName}-${node}-editor`}
                  onUpdateJSON={onUpdateJSON}
                  patternName={patternName}
                  scope={scope}
                  uitkColorOverrides={uitkColorOverrides}
                  value={children.value}
                  valueName={fieldName}
                />
              )
            ) : (
              <TokenStateValue
                uitkColorOverrides={uitkColorOverrides}
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
      </div>
    </div>
  );
};
