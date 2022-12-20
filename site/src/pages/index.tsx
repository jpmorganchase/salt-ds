import clsx from "clsx";
import Link from "@site/src/components/link/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HeroImage from "@site/static/img/hero_image.svg";
import PencilIcon from "@site/static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";

import styles from "./index.module.css";
import Features from "./_index/features/Features";
import Card, { CardProps } from "../components/card/Card";
import HomepageAccordion from "./_index/accordion/Accordion";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  const splitTagline = siteConfig.tagline.split("\n");

  return (
    <div className={styles.heroContainer}>
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className={styles.heroTitle}>Welcome to Salt</h1>
          {splitTagline.map((tagline, index) => (
            <p key={index}>{tagline}</p>
          ))}
          <Link to="/getting-started" className={styles.heroLink}>
            Start using Salt
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
    description: (
      <p>
        Follow our step-by-step process to access our Figma libraries. If you’re
        a developer, we show you how to install and start using the Salt
        packages.
      </p>
    ),
    url: "/getting-started",
    footerText: "Read the guides",
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    icon: <CodeIcon />,
    title: "Browse our components",
    description: (
      <p>
        Our suite of UI components is built with accessibility in mind. Each
        component is thoroughly tested before release and optimized for multiple
        use cases.
      </p>
    ),
    url: "/components",
    footerText: "Explore components",
    keylineColor: "var(--site-tertiary-accent-teal)",
  },
  {
    icon: <ArrowsIcon />,
    title: "Get involved",
    description: (
      <p>
        We welcome bug reports, fixes and other contributions—and would love to
        receive your feedback and suggestions. Reach out to us on GitHub or via
        email.
      </p>
    ),
    url: "/support-and-contributions",
    footerText: "Contact us",
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout>
      <main className={styles.homepageContainer}>
        <HomepageHeader />
        <Features heading="What to expect" listItems={features} />
        <div className={styles.cardContainer}>
          {cards.map((card, index) => {
            const { icon, title, description, url, footerText, keylineColor } =
              card;
            return (
              <Card
                key={index}
                icon={icon}
                title={title}
                description={description}
                url={url}
                footerText={footerText}
                keylineColor={keylineColor}
              />
            );
          })}
        </div>
        <HomepageAccordion />
      </main>
    </Layout>
  );
}
