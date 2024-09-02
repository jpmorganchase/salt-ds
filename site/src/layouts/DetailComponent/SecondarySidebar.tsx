import { useRoute } from "@jpmorganchase/mosaic-store";
import React, { type FC, type ReactNode } from "react";

import { LinkList } from "../../components/link-list/LinkList";
import { Heading4 } from "../../components/mdx/h4";
import { getHrefFromComponent } from "../../utils/getHrefFromComponent";

import { Text } from "@salt-ds/core";
import { RelatedPatterns } from "../DetailPattern/RelatedPatterns";
import type { Data, Relationship } from "./DetailComponent";
import styles from "./SecondarySidebar.module.css";

type SecondarySidebarProps = {
  additionalData?: Data;
  tableOfContents?: ReactNode;
};

const examplesTabRoute = /\/examples$/;

function getRelatedComponentLinks(
  relatedComponents: Data["relatedComponents"],
  relationship: Relationship,
) {
  return relatedComponents
    .filter((component) => component.relationship === relationship)
    .map((component) => ({
      href: getHrefFromComponent(component.name),
      label: component.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const PackageInfo: FC<{ packageInfo: Data["package"] | undefined }> = ({
  packageInfo,
}) => {
  if (packageInfo?.initialVersion) {
    return (
      <div className={styles.wrapper}>
        <Text>Available since </Text>
        <Text styleAs="code">
          {packageInfo.name}@{packageInfo?.initialVersion}
        </Text>
      </div>
    );
  }
  return null;
};

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
    package: packageInfo,
  } = additionalData || {};

  const { route = "" } = useRoute();
  const similarToLinks = getRelatedComponentLinks(
    relatedComponents,
    "similarTo",
  );
  const containsList = getRelatedComponentLinks(relatedComponents, "contains");

  return (
    <div className={styles.sidebar}>
      {tableOfContents && (
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
      <RelatedPatterns />
      <PackageInfo packageInfo={packageInfo} />
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
