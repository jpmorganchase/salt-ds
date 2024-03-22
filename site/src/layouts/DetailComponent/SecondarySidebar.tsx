import React, { FC, ReactNode } from "react";
import { Image } from "@jpmorganchase/mosaic-site-components";
import { Link, Pill } from "@salt-ds/core";
import { Heading4 } from "../../components/mdx/h4";
import { Data, Relationship } from "./DetailComponent";
import { useAllExamplesView } from "../../utils/useAllExamplesView";

import styles from "./SecondarySidebar.module.css";
import { useRoute, SiteState, useStore } from "@jpmorganchase/mosaic-store";

type LinkWithLogoProps = {
  href: string;
  label: string;
  logo: "github" | "figma";
};

const LinkWithLogo: FC<LinkWithLogoProps> = ({ href, label, logo }) => (
  <div className={styles.link}>
    <Image src={`/img/${logo}_logo.svg`} alt={`${logo} logo`} />
    <Link href={href} target="_blank">
      {label}
    </Link>
  </div>
);

type SecondarySidebarProps = {
  additionalData?: Data;
  tableOfContents?: ReactNode;
};

const examplesTabRoute = /\/examples$/;

const SecondarySidebar: FC<SecondarySidebarProps> = ({
  additionalData,
  tableOfContents,
}) => {
  const {
    alsoKnownAs,
    relatedComponents,
    relatedPatterns,
    sourceCodeUrl,
    stickerSheet,
    bugReport,
    featureRequest,
    askQuestion,
  } = additionalData || {};

  const { route = "" } = useRoute();
  const { allExamplesView } = useAllExamplesView();

  const alsoKnownAsPills = alsoKnownAs && alsoKnownAs.length > 0 && (
    <>
      <Heading4>Also known as</Heading4>
      <div className={styles.pills}>
        {alsoKnownAs.map((name) => (
          <Pill key={name}>{name}</Pill>
        ))}
      </div>
    </>
  );

  const relatedComponentsPills = (
    relationshipName: Relationship,
    heading: string
  ) => {
    const components =
      (relatedComponents &&
        relatedComponents.filter(
          ({ relationship }) => relationship === relationshipName
        )) ||
      [];

    return (
      components.length > 0 && (
        <>
          <Heading4>{heading}</Heading4>
          <div className={styles.pills}>
            {components.map(({ name }) => (
              <Pill key={name}>{name}</Pill>
            ))}
          </div>
        </>
      )
    );
  };

  type CustomSiteState = SiteState & { data?: Data };

  function getHrefFromComponent(component: string) {
    // Multiline Input -> multiline-input
    // Input -> input
    // File Drop Zone => file-drop-zone
    const tag = component.replaceAll(/ /g, "-").toLowerCase();
    return `/salt/patterns/${tag}`;
  }

  if (Array.isArray(relatedPatterns) && relatedPatterns.length > 0) {
    return (
      <section className={styles.list}>
        <Heading4>Related patterns</Heading4>
        <ul className={styles.list}>
          {relatedPatterns
            .sort((a, b) => a.localeCompare(b))
            .map((pattern) => (
              <li key={pattern}>
                <Link href={getHrefFromComponent(pattern)}>{pattern}</Link>
              </li>
            ))}
        </ul>
      </section>
    );
  }

  const componentResourcesList = (
    <>
      <Heading4>Resources</Heading4>
      <div className={styles.list}>
        {sourceCodeUrl && (
          <LinkWithLogo
            href={sourceCodeUrl}
            label="View source code"
            logo="github"
          />
        )}
        {stickerSheet && (
          <LinkWithLogo
            href={stickerSheet}
            label="Figma sticker sheet"
            logo="figma"
          />
        )}
      </div>
    </>
  );

  const supportList = (
    <>
      <Heading4>Support</Heading4>
      <div className={styles.list}>
        {bugReport && (
          <LinkWithLogo href={bugReport} label="Report a bug" logo="github" />
        )}
        {featureRequest && (
          <LinkWithLogo
            href={featureRequest}
            label="Request a feature"
            logo="github"
          />
        )}
        {askQuestion && (
          <LinkWithLogo
            href={askQuestion}
            label="Ask a question"
            logo="github"
          />
        )}
      </div>
    </>
  );

  return (
    <div className={styles.sidebar}>
      {(!examplesTabRoute.test(route) || allExamplesView) &&
        tableOfContents && (
          <div className={styles.tableOfContents}>{tableOfContents}</div>
        )}
      <div className={styles.wrapper}>
        {alsoKnownAsPills}
        {relatedComponentsPills("similarTo", "Similar to")}
        {relatedComponentsPills("contains", "Contains")}
      </div>
      <div className={styles.wrapper}>{componentResourcesList}</div>
      <div className={styles.wrapper}>{supportList}</div>
    </div>
  );
};

export default SecondarySidebar;
