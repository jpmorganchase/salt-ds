import { SiteState, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./RelatedPatterns.module.css";
import { LinkList } from "../../components/link-list/LinkList";

type Data = {
  relatedPatterns: string[];
};

type CustomSiteState = SiteState & { data?: Data };

function getHrefFromComponent(component: string) {
  // Multiline Input -> multiline-input
  // Input -> input
  // File Drop Zone => file-drop-zone
  const tag = component.replaceAll(/ /g, "-").toLowerCase();
  return `/salt/patterns/${tag}`;
}

export function RelatedPatterns() {
  const relatedPatterns =
    useStore((state: CustomSiteState) => state.data?.relatedPatterns) ?? [];

  const relatedPatternLinks = relatedPatterns.map((pattern) => ({
    href: getHrefFromComponent(pattern),
    label: pattern,
  }));

  if (relatedPatterns.length > 0) {
    return (
      <section className={styles.root}>
        <LinkList heading="Related patterns" links={relatedPatternLinks} />
      </section>
    );
  }

  return null;
}
