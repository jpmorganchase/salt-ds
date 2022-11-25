import { useRef } from "react";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSection,
  AccordionSummary,
} from "@jpmorganchase/uitk-lab";

import { Metric, MetricContent } from "@jpmorganchase/uitk-lab";

import Arch from "./Arch";
import Waves from "./Waves";
import PageIllustration from "./PageIllustration";

import useOnScreen from "../../utils/useOnScreen";

import styles from "./Accordion.module.css";

const accordionInfo = [
  {
    id: "why-trust-us",
    summary: "Why trust us?",
    details: (
      <>
        <p>In a nutshell, we’re not newbies.</p>
        <p>
          The team behind Salt created the J.P Morgan UI Toolkit, a design
          system that’s used and trusted by internal product owners, visual and
          UX designers, developers, content specialists and more.
        </p>
        <p>
          The UI Toolkit has a proven track record of increasing efficiency,
          ensuring design consistency and driving significant cost savings for
          product teams. It provides a robust component set, business patterns
          and sample apps as well as usage, design, content and accessibility
          guidance. All of this work is the foundation on which we plan to
          improve and migrate to Salt.
        </p>
        <p>
          Eventually, Salt will provide everything you need to create
          consistent, fully accessible, beautifully designed user interfaces.
        </p>
        {/* <div className={styles.metrics}>
          <Metric>
            <MetricContent subvalue="components" value="80+" />
          </Metric>
          <Metric>
            <MetricContent subvalue="patterns" value="10+" />
          </Metric>
          <Metric>
            <MetricContent subvalue="websites and apps created" value="1200+" />
          </Metric>
        </div> */}
      </>
    ),
  },
  {
    id: "future-of-finance",
    summary: "The future of finance",
    details: (
      <>
        <p>
          Finance and design are sometimes uncomfortable bedfellows. Beautiful,
          responsive designs don’t always lend themselves to tickets, blotters
          and data-heavy tables.
        </p>
        <p>We hope to bridge that gap.</p>
        <p>
          Salt components are tried and tested in the investment banking arena.
          Underpinned by beautiful and functional design, they support the
          creation of great user experiences across all devices.
        </p>
        {/* <div className={styles.wavesContainer}>
          <Waves />
        </div> */}
      </>
    ),
  },
  {
    id: "join-us",
    summary: "Join us on this odyssey",
    details: (
      <>
        <p>
          This is our first foray into the public domain. But we have ambitious
          plans.
        </p>
        <p>
          Salt’s predecessor was built with multiple third-party dependencies,
          which added significant weight and complexity to our library. We’re
          rebuilding and enhancing each and every component—striving for
          accessibility, lightweight code and flexibility in theming and
          presentation.
        </p>
        <p>
          We’d love to share this journey with you, with your input and
          contributions informing and shaping our next steps. Get in touch to
          share your feedback.
        </p>
        {/* <div className={styles.wavesContainer}>
          <Arch />
        </div> */}
      </>
    ),
  },
];

const SiteAccordion = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");
  return (
    <div className={styles.accordionContainer}>
      <PageIllustration />
      <div className={styles.wrapper}>
        <Accordion
          className={styles.accordion}
          defaultExpandedSectionIds={[accordionInfo[0].id]}
          maxExpandedItems={1}
        >
          {accordionInfo.map(({ id, summary, details }) => {
            return (
              <AccordionSection className={styles.accordion} key={id} id={id}>
                <AccordionSummary className={styles.summary}>
                  <h2>{summary}</h2>
                </AccordionSummary>
                <AccordionDetails>{details}</AccordionDetails>
              </AccordionSection>
            );
          })}
        </Accordion>
        <div
          className={clsx(styles.keyline, { [styles.animate]: onScreen })}
          ref={ref}
        />
      </div>
    </div>
  );
};

export default SiteAccordion;
