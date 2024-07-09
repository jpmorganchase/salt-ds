import clsx from "clsx";
import { useRef } from "react";

import Accordion, {
  type AccordionBaseProps,
} from "../../components/accordion/Accordion";
import useOnScreen from "../../utils/useOnScreen";
import styles from "./Accordion.module.css";
import PageIllustration from "./PageIllustration";

type HomepageAccordionProps = {
  homePageInfo: AccordionBaseProps["accordionInfo"];
};

const HomepageAccordion = ({
  homePageInfo,
}: HomepageAccordionProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

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
