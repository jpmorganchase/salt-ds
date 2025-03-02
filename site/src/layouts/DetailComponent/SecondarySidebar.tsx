import type { FC, ReactNode } from "react";

import { LinkList } from "../../components/link-list/LinkList";
import { getHrefFromComponent } from "../../utils/getHrefFromComponent";
import { RelatedPatterns } from "../DetailPattern/RelatedPatterns";
import type { Data, Relationship } from "./DetailComponent";
import styles from "./SecondarySidebar.module.css";

type SecondarySidebarProps = {
  additionalData: Data;
  tableOfContents?: ReactNode;
};

function getRelatedComponentLinks(
  relatedComponents: Data["relatedComponents"],
  relationship: Relationship,
) {
  return (
    relatedComponents
      ?.filter((component) => component.relationship === relationship)
      .map((component) => ({
        href: getHrefFromComponent(component.name),
        label: component.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) ?? []
  );
}

const SecondarySidebar: FC<SecondarySidebarProps> = ({
  additionalData,
  tableOfContents,
}) => {
  const { relatedComponents = [] } = additionalData;

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
        <LinkList heading="Similar to" links={similarToLinks} />
        <LinkList heading="Contains" links={containsList} />
      </div>
      <RelatedPatterns />
    </div>
  );
};

export default SecondarySidebar;
