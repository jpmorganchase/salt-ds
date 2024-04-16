import { SiteState, useStore } from "@jpmorganchase/mosaic-store";

import { getHrefFromComponent } from "../../utils/getHrefFromComponent";
import { LinkList } from "../../components/link-list/LinkList";

import styles from "./Resources.module.css";

type Data = {
  components: string[];
};

type CustomSiteState = SiteState & { data?: Data };

export function Components() {
  const components =
    useStore((state: CustomSiteState) => state.data?.components) ?? [];

  const componentLinks = components.map((component) => ({
    href: getHrefFromComponent(component),
    label: component,
  }));

  if (components.length > 0) {
    return (
      <section className={styles.root}>
        <LinkList heading="Components" links={componentLinks} />
      </section>
    );
  }

  return null;
}
