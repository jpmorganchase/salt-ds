import { ReactElement } from "react";
import Accordion, {
  AccordionBaseProps,
} from "../../../src/components/accordion/Accordion";
import styles from "./DevelopFontsAccordion.module.css";

type DevelopFontsAccordionProps = {
  id: string;
  summary: string;
  children: ReactElement;
};

const DevelopFontsAccordion = ({
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

export default DevelopFontsAccordion;
