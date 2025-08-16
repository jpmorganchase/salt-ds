import { Link, Text, useId } from "@salt-ds/core";
import { LinkBase } from "../link/Link";
import { Heading4 } from "../mdx/h4";
import { Image } from "../mdx/image";
import styles from "./LinkList.module.css";

type LinkData = { href: string; label: string };

function isValid(link: LinkData) {
  return link.href && link.label;
}

function getLogoFromHref(href: string) {
  try {
    const hostname = new URL(href).hostname;
    const hostnameParts = hostname.split(".");
    const subDomain = hostnameParts[0];
    const domain = hostnameParts.slice(-2).join(".");

    switch (domain) {
      case "figma.com":
        return "figma";
      case "github.com":
        return "github";
      case "saltdesignsystem.com":
        if (subDomain === "storybook") {
          return "storybook";
        }
        return null;
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}

function LinkWithLogo({ href, label }: LinkData) {
  const logo = getLogoFromHref(href);

  if (!logo) {
    return <Link href={href}>{label}</Link>;
  }

  return (
    <div className={styles.link}>
      <Image
        className={styles.linkImage}
        src={`/img/${logo}_logo.svg`}
        alt={""}
        aria-hidden
      />
      <Link
        render={<LinkBase href={href} />}
        href={href}
        target="_blank"
        IconComponent={null}
      >
        {label}
      </Link>
    </div>
  );
}

export function LinkList({
  heading,
  subheader,
  links,
}: {
  heading?: string;
  subheader?: string;
  links: { href: string; label: string }[];
}) {
  const titleId = useId();

  if (!Array.isArray(links) || links.length === 0) {
    return null;
  }

  const hasHeader = Boolean(heading || subheader);

  return (
    <aside
      aria-labelledby={hasHeader ? titleId : undefined}
      className={styles.root}
    >
      {hasHeader && (
        <div id={titleId}>
          {heading && <Heading4 className={styles.heading}>{heading}</Heading4>}
          {subheader && (
            <Text className={styles.subheader} styleAs="label">
              {subheader}
            </Text>
          )}
        </div>
      )}
      <ul className={styles.list}>
        {links
          .filter((link) => isValid(link))
          .map((link) => (
            <li key={link.label}>
              <LinkWithLogo href={link.href} label={link.label} />
            </li>
          ))}
      </ul>
    </aside>
  );
}
