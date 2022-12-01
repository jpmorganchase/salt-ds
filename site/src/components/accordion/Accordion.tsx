import {
  Accordion,
  AccordionDetails,
  AccordionSection,
  AccordionSummary,
} from "@jpmorganchase/uitk-lab";

import styles from "./Accordion.module.css";

export type AccordionInfoType = {
  id: string;
  summary: string;
  details: JSX.Element;
};

interface AccordionBaseProps {
  accordionInfo: AccordionInfoType[];
  defaultExpandedSectionIds?: string[];
}

const AccordionBase = ({
  accordionInfo,
  defaultExpandedSectionIds,
}: AccordionBaseProps): JSX.Element => {
  return (
    <Accordion
      className={styles.accordion}
      defaultExpandedSectionIds={defaultExpandedSectionIds}
      maxExpandedItems={1}
    >
      {accordionInfo.map(({ id, summary, details }) => {
        return (
          <AccordionSection className={styles.section} key={id} id={id}>
            <AccordionSummary className={styles.summary}>
              <h2>{summary}</h2>
            </AccordionSummary>
            <AccordionDetails>{details}</AccordionDetails>
          </AccordionSection>
        );
      })}
    </Accordion>
  );
};

export default AccordionBase;
