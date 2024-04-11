import React, { FC, ReactNode } from "react";
import { useRoute } from "@jpmorganchase/mosaic-store";

import { Heading4 } from "../../components/mdx/h4";
import { useAllExamplesView } from "../../utils/useAllExamplesView";
import { LinkList } from "../../components/link-list/LinkList";
import { getHrefFromComponent } from "../../utils/getHrefFromComponent";

import { Data, Relationship } from "./DetailComponent";
import styles from "./SecondarySidebar.module.css";

type SecondarySidebarProps = {
  additionalData?: Data;
  tableOfContents?: ReactNode;
};

const examplesTabRoute = /\/examples$/;

function getRelatedComponentLinks(
  relatedComponents: Data["relatedComponents"],
  relationship: Relationship
) {
  return relatedComponents
    .filter((component) => component.relationship === relationship)
    .map((component) => ({
      href: getHrefFromComponent(component.name),
      label: component.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const SecondarySidebar: FC<SecondarySidebarProps> = ({
  additionalData,
  tableOfContents,
}) => {
  const {
    alsoKnownAs = [],
    relatedComponents = [],
    sourceCodeUrl = "",
    bugReport = "",
    featureRequest = "",
  } = additionalData || {};

  const { route = "" } = useRoute();
  const { allExamplesView } = useAllExamplesView();
  const similarToLinks = getRelatedComponentLinks(
    relatedComponents,
    "similarTo"
  );
  const containsList = getRelatedComponentLinks(relatedComponents, "contains");

  return (
    <div className={styles.sidebar}>
      {(!examplesTabRoute.test(route) || allExamplesView) &&
        tableOfContents && (
          <div className={styles.tableOfContents}>{tableOfContents}</div>
        )}
      <div className={styles.wrapper}>
        {alsoKnownAs.length > 0 && (
          <>
            <Heading4>Also known as</Heading4>
            <div>{alsoKnownAs.join(", ")}</div>
          </>
        )}
        <LinkList heading="Similar to" links={similarToLinks} />
        <LinkList heading="Contains" links={containsList} />
      </div>
      <div className={styles.wrapper}>
        <LinkList
          heading="Resources"
          links={[
            {
              href: sourceCodeUrl,
              label: "View source code",
            },
          ]}
        />
      </div>
      <div className={styles.wrapper}>
        <LinkList
          heading="Support"
          links={[
            {
              href: bugReport,
              label: "Report a bug",
            },
            {
              href: featureRequest,
              label: "Request a feature",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SecondarySidebar;
