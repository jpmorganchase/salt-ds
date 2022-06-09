import { ReactElement } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  AccordionDetails,
  AccordionSection,
  AccordionSummary,
  capitalize,
} from "@jpmorganchase/uitk-lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { ChildrenValues } from "../../ChildrenValues";

const withBaseName = makePrefixer("uitkPaletteSentiment");

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
          Object.keys(props.sentimentValues)
            .sort((k1, k2) =>
              ["cta", "primary", "secondary", "tertiary"].includes(k1) ? 1 : -1
            )
            .sort((a, b) =>
              Object.keys(props.sentimentValues[a]).includes("value") &&
              Object.keys(props.sentimentValues[a]).length === 1
                ? -1
                : 1
            )

            .map((intent) => {
              const [values, fieldName] =
                intent === "value"
                  ? [props.sentimentValues, intent]
                  : [props.sentimentValues[intent], intent];

              return (
                <div
                  className={withBaseName()}
                  key={`${props.sentimentName}-${intent}`}
                >
                  <ChildrenValues
                    key={`${props.sentimentName}-${intent}-${fieldName}`}
                    characteristicsView={true}
                    children={values}
                    uitkColorOverrides={props.uitkColorOverrides}
                    extractValue={props.extractValue}
                    fieldName={fieldName}
                    onUpdateJSON={props.onUpdateJSON}
                    patternName={props.sentimentName}
                    scope={props.scope}
                  />
                </div>
              );
            })}
      </AccordionDetails>
    </AccordionSection>
  );
};
