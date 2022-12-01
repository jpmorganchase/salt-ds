import { useRef } from "react";
import clsx from "clsx";

import PageIllustration from "./PageIllustration";
import useOnScreen from "../../../utils/useOnScreen";
import Accordion from "../../../components/accordion/Accordion";
import { homePageInfo } from "../../../components/accordion/info/homepage";
import styles from "./Accordion.module.css";

const HomepageAccordion = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-50px");
  return (
    <div className={styles.accordionContainer}>
      <PageIllustration />
      <div className={styles.accordionWrapper}>
        <Accordion
          accordionInfo={homePageInfo}
          defaultExpandedSectionIds={[homePageInfo[0].id]}
        />
        <div
          className={clsx(styles.keyline, { [styles.animate]: onScreen })}
          ref={ref}
        />
      </div>
    </div>
  );
};

export default HomepageAccordion;
