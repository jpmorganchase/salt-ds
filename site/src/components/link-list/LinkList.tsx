import { Image } from "@jpmorganchase/mosaic-site-components";

import { Heading4 } from "../mdx/h4";
import { Link } from "../mdx/link";

import styles from "./LinkList.module.css";
import { Text } from "@salt-ds/core";

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
      <Image src={`/img/${logo}_logo.svg`} alt={""} aria-hidden />
      <Link href={href} target="_blank">
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
  if (!Array.isArray(links) || links.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      {heading && <Heading4 className={styles.heading}>{heading}</Heading4>}
      {subheader && (
        <Text className={styles.subheader} styleAs="label">
          {subheader}
        </Text>
      )}
      <ul className={styles.list}>
        {links
          .filter((link) => isValid(link))
          .map((link) => (
            <li>
              <LinkWithLogo
                href={link.href}
                label={link.label}
                key={link.label}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}
