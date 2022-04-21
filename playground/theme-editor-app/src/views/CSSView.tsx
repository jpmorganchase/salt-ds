import { ReactElement } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSection,
  AccordionSummary,
} from "@jpmorganchase/uitk-lab";
import { CSSByPattern } from "@jpmorganchase/theme-editor/src/helpers/parseToCss";

interface CSSViewProps {
  cssByPattern: CSSByPattern[];
  directoryName: string;
}

export const CSSView = (props: CSSViewProps): ReactElement => {
  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <span style={{ fontSize: "14px" }}>
        CSS successfully saved to {props.directoryName}
      </span>
      <div style={{ margin: "20px 0px" }}>
        <Accordion>
          {props.cssByPattern.map((element) => {
            return (
              <AccordionSection key={`${element.pattern}.css`}>
                <AccordionSummary>{element.pattern}.css</AccordionSummary>
                <AccordionDetails>
                  <pre>
                    <code style={{ fontSize: "12px" }}>{element.cssObj}</code>
                  </pre>
                </AccordionDetails>
              </AccordionSection>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
