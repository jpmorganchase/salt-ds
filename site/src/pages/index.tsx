import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HeroImage from "@site/static/img/hero_image.svg";
import PencilIcon from "@site/static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";
import { Button } from "@jpmorganchase/uitk-core";

import styles from "./index.module.css";
import Features from "./_index/features/Features";
import Card, { CardProps } from "../components/card/Card";
import Accordion from "./_index/accordion/Accordion";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  const splitTagline = siteConfig.tagline.split("\n");

  return (
    <div className={styles.heroContainer}>
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          {splitTagline.map((tagline, index) => (
            <p key={index}>{tagline}</p>
          ))}
          <Link to="/getting-started">
            <Button variant="cta">Start using Salt</Button>
          </Link>
        </div>
      </header>

      <HeroImage className={styles.heroImage} />
    </div>
  );
}

const features = [
  "Step-by-step installation guides",
  "Comprehensive migration resources for J.P. Morgan teams",
  "Components and patterns that are tested against WCAG 2.1 AA",
  "Theming and rebranding support",
  "Responsiveness as standard",
  "Hooks, utilities and design tokens",
  "Modular building blocks",
  "A lightweight, efficient codebase",
];

const cards: CardProps[] = [
  {
    icon: <PencilIcon />,
    title: "Design and develop",
    description:
      "Follow our step-by-step process to access our Figma libraries. If you’re a developer, we show you how to install and start using the Salt packages.",
    url: "/getting-started",
    linkText: "Read the guides",
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    icon: <CodeIcon />,
    title: "Browse our components",
    description:
      "Our suite of UI components is built with accessibility in mind. Each component is thoroughly tested before release and customizable for multiple use cases.",
    url: "/components",
    linkText: "Explore components",
    keylineColor: "var(--site-tertiary-accent-teal)",
  },
  {
    icon: <ArrowsIcon />,
    title: "Get involved",
    description:
      "We welcome bug reports, fixes and other contributions—and would love to receive your feedback and suggestions. Reach out to us on GitHub or via email.",
    url: "/support-and-contributions",
    linkText: "Contact us",
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
];

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />"
    >
      <div className={styles.homepageContainer}>
        <HomepageHeader />
        <Features heading="What to expect" listItems={features} />
        <div className={styles.cardContainer}>
          {cards.map((card, index) => {
            const { icon, title, description, url, linkText, keylineColor } =
              card;
            return (
              <Card
                key={index}
                icon={icon}
                title={title}
                description={description}
                url={url}
                linkText={linkText}
                keylineColor={keylineColor}
              />
            );
          })}
        </div>
        <Accordion />
      </div>
    </Layout>
  );
}
