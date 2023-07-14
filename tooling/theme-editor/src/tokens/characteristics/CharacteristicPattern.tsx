import { clsx } from "clsx";
import { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { capitalize, makePrefixer } from "@salt-ds/core";
import { AccordionPanel, Accordion, AccordionHeader } from "@salt-ds/lab";
import { JSONObj } from "../../helpers/parseToJson";
import { ChildrenValuesWithinSection } from "../ChildrenValues";
import { ScopeLabel } from "../labels/ScopeLabel";
import "./Characteristics.css";

const withBaseName = makePrefixer("saltCharacteristicPattern");
export interface CharacteristicPatternProps {
  expandedCharacteristics: string[];
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  saltColorOverrides?: Record<string, string>;
  values: JSONObj;
}

export const CharacteristicPattern = (
  props: CharacteristicPatternProps
): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Accordion
      expanded={props.expandedCharacteristics.includes(props.patternName)}
      value={props.patternName}
      onToggle={() => {
        let characteristics;
        if (props.expandedCharacteristics.includes(props.patternName)) {
          const openSections = searchParams.get("open");
          characteristics = props.patternName;
          if (openSections) {
            characteristics = [characteristics, openSections].join("&");
          }
        } else {
          const characteristicsOpen = searchParams.get("open")?.split("&");
          if (characteristicsOpen) {
            characteristics = characteristicsOpen
              .filter((color) => color !== props.patternName)
              .join("&");
          }
        }
        characteristics
          ? setSearchParams({ open: characteristics })
          : setSearchParams({});
      }}
    >
      <AccordionHeader>
        {capitalize(props.patternName) as string}
      </AccordionHeader>
      <AccordionPanel>
        {props.values &&
          Object.keys(props.values).map((scope) => {
            return (
              <div
                key={`${props.patternName}-${scope}`}
                className={clsx("saltEmphasisHigh", withBaseName())}
              >
                <ScopeLabel scope={scope} />
                {Object.keys(props.values[scope])
                  .sort((a, b) => (a > b ? 1 : -1))
                  .sort((a, b) =>
                    Object.keys(props.values[scope][a]).includes("value") &&
                    Object.keys(props.values[scope][a]).length === 1
                      ? -1
                      : 1
                  )
                  .map(function (node) {
                    const [values, fieldName] =
                      node === "value"
                        ? [props.values[scope], props.patternName]
                        : [props.values[scope][node], node];

                    return (
                      <ChildrenValuesWithinSection
                        characteristicsView={true}
                        children={values}
                        saltColorOverrides={props.saltColorOverrides}
                        extractValue={props.extractValue}
                        fieldName={fieldName}
                        onUpdateJSON={props.onUpdateJSON}
                        patternName={props.patternName}
                        scope={props.scope}
                      />
                    );
                  })}
              </div>
            );
          })}
      </AccordionPanel>
    </Accordion>
  );
};
