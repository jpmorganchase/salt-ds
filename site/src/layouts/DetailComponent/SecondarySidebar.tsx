import React, { FC } from "react";
import { TableOfContents, Image } from "@jpmorganchase/mosaic-site-components";
import { Pill } from "@salt-ds/lab";
import { Link } from "@salt-ds/core";
import { Heading4 } from "../../components/mdx/h4";
import { Data, Relationship } from "./DetailComponent";

import styles from "./SecondarySidebar.module.css";

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

type SecondarySidebarProps = { additionalData?: Data };

const SecondarySidebar: FC<SecondarySidebarProps> = ({ additionalData }) => {
  const {
    alsoKnownAs,
    relatedComponents,
    sourceCodeUrl,
    componentGuide,
    bugReport,
    featureRequest,
    askQuestion,
  } = additionalData || {};

  const alsoKnownAsPills = alsoKnownAs && (
    <>
      <Heading4>Also known as</Heading4>
      <div className={styles.pills}>
        {alsoKnownAs.map((name) => (
          <Pill key={name} label={name} />
        ))}
      </div>
    </>
  );

  const relatedComponentsPills = (
    relationshipName: Relationship,
    heading: string
  ) =>
    relatedComponents && (
      <>
        <Heading4>{heading}</Heading4>
        <div className={styles.pills}>
          {relatedComponents
            .filter(({ relationship }) => relationship === relationshipName)
            .map(({ name }) => (
              <Pill key={name} label={name} />
            ))}
        </div>
      </>
    );

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
        {componentGuide && (
          <LinkWithLogo
            href={componentGuide}
            label="Read the component guide"
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
      <div className={styles.tableOfContents}>
        <TableOfContents />
      </div>
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
