import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { fontFileTable } from "../../src/components/accordion/info/develop";
import Accordion from "../../src/components/accordion/Accordion";
import styles from "./DevelopFontsAccordion.module.css";

const DevelopFontsAccordion = (): JSX.Element => {
  return (
    <div className={styles.accordionWrapper}>
      <Accordion accordionInfo={fontFileTable} />
      <ToolkitProvider mode="dark">
        <hr />
      </ToolkitProvider>
    </div>
  );
};

export default DevelopFontsAccordion;
