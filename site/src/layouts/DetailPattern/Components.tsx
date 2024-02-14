import { Heading4 } from "../../components/mdx/h4";
import { SiteState, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./Resources.module.css";
import { Link } from "@salt-ds/core";

type Data = {
  components: string[];
};

type CustomSiteState = SiteState & { data?: Data };

function getHrefFromComponent(component: string) {
  // Multiline Input -> multiline-input
  // Input -> input
  // File Drop Zone => file-drop-zone
  const tag = component.replaceAll(/ /g, "-").toLowerCase();
  return `/salt/components/${tag}`;
}

export function Components() {
  const components =
    useStore((state: CustomSiteState) => state.data?.components) ?? [];

  if (components.length > 0) {
    return (
      <section className={styles.root}>
        <Heading4>Components</Heading4>
        <ul className={styles.list}>
          {components
            .sort((a, b) => a.localeCompare(b))
            .map((component) => (
              <li key={component}>
                <Link href={getHrefFromComponent(component)}>{component}</Link>
              </li>
            ))}
        </ul>
      </section>
    );
  }

  return null;
}
