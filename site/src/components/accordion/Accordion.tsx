import { ComponentPropsWithoutRef, useMemo, useRef } from "react";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionDetailsProps,
  AccordionProps,
  AccordionSection,
  AccordionSectionProps,
  AccordionSummary,
  AccordionSummaryProps,
} from "@jpmorganchase/uitk-lab";

import PencilIcon from "@site/static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";
import useOnScreen from "../../utils/useOnScreen";

import styles from "./Accordion.module.css";

type CardIconName = "pencil" | "code" | "arrows";

type CardIconsType = {
  name: CardIconName;
  icon: JSX.Element;
}[];

const cardIcons: CardIconsType = [
  { name: "pencil", icon: <PencilIcon className={styles.icon} /> },
  { name: "code", icon: <CodeIcon className={styles.icon} /> },
  { name: "arrows", icon: <ArrowsIcon className={styles.icon} /> },
];

const getKeylineColor = (icon: CardIconName) => {
  switch (icon) {
    case "pencil":
      return "purple-50";
    case "code":
      return "teal-50";
    case "arrows":
      return "orange-30";
    default:
      return "orange-30";
  }
};

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon: CardIconName;
  title: string;
  description: string;
  url: string;
  linkText: string;
}

const accordianInfo = [
  {
    id: "why-trust-us",
    summary: "Why trust us?",
    details: (
      <>
        <p>In a nutshell, we’re not newbies.</p>
        <p>
          The team behind Salt created the J.P Morgan UI Toolkit, a design
          system that’s used and trusted by over 2,000 internal product owners,
          visual and UX designers, developers, content specialists and more. It
          has a track record of increasing efficiency, ensuring design
          consistency and driving significant cost savings for product teams.
        </p>
        <p>
          The UI Toolkit has over 80 components, 12 patterns, sample apps, as
          well as usage, design, content and accessibility guidance that we plan
          to improve and migrate to Salt. Eventually, Salt will provide
          everything you need to create consistent, fully accessible,
          beautifully designed user interfaces.
        </p>
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
          accessibility, lightweight code, with flexibility in theming and
          presentation.
        </p>
        <p>
          We’d love to share this journey with you, with your input and
          contributions informing and shaping our next steps. Get in touch to
          share your feedback.
        </p>
      </>
    ),
  },
];

const SiteAccordian = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");
  return (
    <div className={styles.wrapper}>
      <Accordion className={styles.wrapper}>
        {accordianInfo.map(({ id, summary, details }) => {
          return (
            <AccordionSection className={styles.accordion} key={id}>
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
        style={{
          backgroundColor: `var(--uitk-color-teal-50)`,
        }}
        ref={ref}
      />
    </div>
  );
};

export default SiteAccordian;
