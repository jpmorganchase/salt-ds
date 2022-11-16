import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HeroImage from "@site/static/img/hero_image.svg";
import { Button } from "@jpmorganchase/uitk-core";

import styles from "./index.module.css";
import Features from "../components/features/Features";
import Card, { CardProps } from "../components/card/Card";

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
            <Button variant="cta">Get started</Button>
          </Link>
        </div>
      </header>

      <HeroImage className={styles.heroImage} />
    </div>
  );
}

const features = [
  "Easy installation with step-by-step guidance",
  "Streamlined migration, if you’re upgrading from UI Toolkit",
  "A lightweight, efficient codebase",
  "Theming and rebranding support",
  "Modular building blocks",
  "Hooks, utilities and design tokens",
  "Responsive layouts, enabled for mobile interfaces",
  "Fully accessible and WCAG 2.1 AA compliant components",
];

const cards: CardProps[] = [
  {
    icon: "pencil",
    title: "Get started",
    description:
      "Follow our simple step-by-step process for installing the Salt packages and Figma library, whether you’re a designer or developer. It also covers theming, styling and how to add other aspects of customization to suit your needs. ",
    url: "/getting-started",
    linkText: "Browse our getting started guides",
  },
  {
    icon: "code",
    title: "Browse our components",
    description:
      "Our suite of React-based components is built accessibly from the ground up, fully customizable, usability tested and most importantly, lightweight. Find what you need to create simple forms and a license-free, fast DataGrid.",
    url: "/components",
    linkText: "Explore the component library",
  },
  {
    icon: "arrows",
    title: "Make a contribution",
    description:
      "We welcome bug reports, fixes and other contributions, and would love to receive your feedback and suggestions. Use our GitHub templates to reach out to us.",
    url: "/contributing",
    linkText: "Learn more on how to contribute",
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
            const { icon, title, description, url, linkText } = card;
            return (
              <Card
                key={index}
                icon={icon}
                title={title}
                description={description}
                url={url}
                linkText={linkText}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
