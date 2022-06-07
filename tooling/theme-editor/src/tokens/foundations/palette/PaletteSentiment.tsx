import { ReactElement } from "react";
import {
  AccordionDetails,
  AccordionSection,
  AccordionSummary,
  capitalize,
} from "@jpmorganchase/uitk-lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { ChildrenValuesWithinSection } from "../../ChildrenValues";

export interface PaletteSentimentProps {
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  sentimentName: string;
  scope: string;
  themeName: string;
  uitkColorOverrides?: Record<string, string>;
  sentimentValues: JSONObj;
}

export const PaletteSentiment = (
  props: PaletteSentimentProps
): ReactElement => {
  return (
    <AccordionSection>
      <AccordionSummary>{capitalize(props.sentimentName)}</AccordionSummary>
      <AccordionDetails>
        {props.sentimentValues &&
          Object.keys(props.sentimentValues).map((scope) => {
            return (
              <div key={`${props.sentimentName}-${scope}`}>
                {Object.keys(props.sentimentValues[scope])
                  .sort((a, b) => (a > b ? 1 : -1))
                  .sort((a, b) =>
                    Object.keys(props.sentimentValues[scope][a]).includes(
                      "value"
                    ) &&
                    Object.keys(props.sentimentValues[scope][a]).length === 1
                      ? -1
                      : 1
                  )
                  .map(function (node) {
                    const [values, fieldName] =
                      node === "value"
                        ? [props.sentimentValues[scope], props.sentimentName]
                        : [props.sentimentValues[scope][node], node];

                    return (
                      <ChildrenValuesWithinSection
                        characteristicsView={true}
                        children={values}
                        uitkColorOverrides={props.uitkColorOverrides}
                        extractValue={props.extractValue}
                        fieldName={fieldName}
                        onUpdateJSON={props.onUpdateJSON}
                        patternName={props.sentimentName}
                        scope={props.scope}
                      />
                    );
                  })}
              </div>
            );
          })}
      </AccordionDetails>
    </AccordionSection>
  );
};
