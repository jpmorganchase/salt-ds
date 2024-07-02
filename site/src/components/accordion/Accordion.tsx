import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
} from "@salt-ds/core";

import styles from "./Accordion.module.css";

export type AccordionInfoType = {
  id: string;
  summary: JSX.Element | string;
  details: JSX.Element;
};

export interface AccordionBaseProps {
  accordionInfo: AccordionInfoType[];
  defaultExpandedSectionIds?: string[];
}

const AccordionBase = ({
  accordionInfo,
  defaultExpandedSectionIds,
}: AccordionBaseProps): JSX.Element => {
  return (
    <AccordionGroup className={styles.group}>
      {accordionInfo.map(({ id, summary, details }) => {
        return (
          <Accordion
            className={styles.accordion}
            key={id}
            value={id}
            defaultExpanded={defaultExpandedSectionIds?.includes(id)}
          >
            <AccordionHeader className={styles.header}>
              {summary}
            </AccordionHeader>
            <AccordionPanel className={styles.panel}>{details}</AccordionPanel>
          </Accordion>
        );
      })}
    </AccordionGroup>
  );
};

export default AccordionBase;
