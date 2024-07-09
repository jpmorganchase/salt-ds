import type { ReactElement } from "react";
import Accordion, { type AccordionBaseProps } from "../../accordion/Accordion";
import styles from "./DevelopFontsAccordion.module.css";

type DevelopFontsAccordionProps = {
  id: string;
  summary: string;
  children: ReactElement;
};

export const DevelopFontsAccordion = ({
  id,
  summary,
  children,
}: DevelopFontsAccordionProps) => {
  const fontFileTable: AccordionBaseProps["accordionInfo"] = [
    {
      id,
      summary: <strong className={styles.summary}>{summary}</strong>,
      details: children,
    },
  ];

  return (
    <div className={styles.accordionWrapper}>
      <Accordion accordionInfo={fontFileTable} />
    </div>
  );
};
