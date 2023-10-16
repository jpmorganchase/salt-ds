import { Heading4 } from "../../components/mdx/h4";
import { SiteState, useMeta, useStore } from "@jpmorganchase/mosaic-store";
import styles from "./Resources.module.css";
import { Image } from "@jpmorganchase/mosaic-site-components";
import { Link, Text } from "@salt-ds/core";

const LinkWithLogo = ({ href, label }: { href: string; label: string }) => (
  <div className={styles.link}>
    {href.includes("figma.com") && (
      <Image src={`/img/figma_logo.svg`} alt=" figma logo" />
    )}
    {href.includes("github.com") && (
      <Image src="/img/github_logo.svg" alt="github logo" />
    )}
    <Link href={href} target="_blank">
      {label}
    </Link>
  </div>
);

type Data = {
  resources: Array<{
    href: string;
    label: string;
    internal?: boolean;
  }>;
};

type CustomSiteState = SiteState & { data?: Data };

export function Resources() {
  const {
    meta: { title },
  } = useMeta();

  const resources =
    useStore((state: CustomSiteState) => state.data?.resources) ?? [];

  const internalResources = resources.filter(({ internal }) => internal);
  const externalResources = resources.filter(({ internal }) => !internal);
  if (resources.length) {
    return (
      <div className={styles.root}>
        <Heading4>{title} resources</Heading4>
        {externalResources.length > 0 && (
          <div className={styles.list}>
            {externalResources.map(({ href, label }) => (
              <LinkWithLogo key={href} href={href} label={label} />
            ))}
          </div>
        )}
        {internalResources.length > 0 && (
          <>
            <Text className={styles.subtitle} styleAs="label">
              JPM employees only:
            </Text>
            <div className={styles.list}>
              {internalResources.map(({ href, label }) => (
                <LinkWithLogo key={href} href={href} label={label} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
}
