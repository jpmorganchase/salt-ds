import { SiteState, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./Resources.module.css";
import { Image } from "@jpmorganchase/mosaic-site-components";
import { Link } from "@salt-ds/core";
import { LinkList } from "../../components/link-list/LinkList";

const LinkWithLogo = ({ href, label }: { href: string; label: string }) => (
  <div className={styles.link}>
    {href.includes("figma.com") && <Image src="/img/figma_logo.svg" alt="" />}
    {href.includes("github.com") && <Image src="/img/github_logo.svg" alt="" />}
    {href.includes("storybook") && (
      <Image src="/img/storybook_logo.svg" alt="" />
    )}
    <Link href={href} target="_blank">
      {label}
    </Link>
  </div>
);

type Resources = {
  href: string;
  label: string;
  internal?: boolean;
}[];

function splitResources(resources: Resources) {
  return resources.reduce(
    (acc, resource) => {
      if (resource.internal) {
        acc.internal.push(resource);
      } else {
        acc.external.push(resource);
      }
      return acc;
    },
    { internal: [], external: [] } as {
      internal: Resources;
      external: Resources;
    }
  );
}

type Data = {
  resources: Resources;
};

type CustomSiteState = SiteState & { data?: Data };

export function Resources() {
  const resourcesArray =
    useStore((state: CustomSiteState) => state.data?.resources) ?? [];

  const { internal, external } = splitResources(resourcesArray);

  if (resourcesArray.length > 0) {
    return (
      <section className={styles.root}>
        <LinkList heading="Resources" links={external} />
        <LinkList subheader="J.P. Morgan employees only:" links={internal} />
      </section>
    );
  }
  return null;
}
