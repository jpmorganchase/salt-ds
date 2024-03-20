import { Heading4 } from "../../components/mdx/h4";
import { SiteState, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./RelatedPatterns.module.css";
import { Link } from "@salt-ds/core";

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

  if (relatedPatterns.length > 0) {
    return (
      <section className={styles.root}>
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

  return null;
}
