import React from "react";
import { Link, Image } from "@jpmorganchase/mosaic-site-components";
import Features from "src/_index/features/Features";
import { Card, CardProps } from "src/components/card/Card";
import HomepageAccordion from "src/_index/accordion/Accordion";
import styles from "./index.module.css";

const tagline = `Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.
Salt is the next-generation version of the established internal J.P. Morgan UI Toolkit design system, which has been used to build over 1,200 websites and applications to date.
In time, as a full-service solution, Salt will be the vehicle for digital delivery of a universal design language—with best-in-class business patterns, content and accessibility guides, tooling and adoption resources.`;

const HomepageHeader = () => {
  const splitTagline = tagline.split("\n");

  return (
    <div className={styles.heroContainer}>
      <header className={styles.heroBanner}>
        <div className={styles.content}>
          <h1 className={styles.heroTitle}>Welcome to Salt</h1>
          {splitTagline.map((tagline, index) => (
            <p key={index}>{tagline}</p>
          ))}
          <Link href="./getting-started" className={styles.heroLink}>
            Start using Salt
          </Link>
        </div>
      </header>

      <Image
        className={styles.heroImage}
        src="/img/hero_image.svg"
        alt="hero image"
      />
    </div>
  );
};

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
    icon: <Image src="/img/pencil.svg" alt="pencil icon" />,
    title: "Design and develop",
    description: (
      <p>
        Follow our step-by-step process to access our Figma libraries. If you’re
        a developer, we show you how to install and start using the Salt
        packages.
      </p>
    ),
    url: "./getting-started",
    footerText: "Read the guides",
    keylineColor: "var(--site-tertiary-accent-purple)",
  },
  {
    icon: <Image src="/img/code.svg" alt="code brackets icon" />,
    title: "Browse our components",
    description: (
      <p>
        Our suite of UI components is built with accessibility in mind. Each
        component is thoroughly tested before release and optimized for multiple
        use cases.
      </p>
    ),
    url: "./components",
    footerText: "Explore components",
    keylineColor: "var(--site-tertiary-accent-teal)",
  },
  {
    icon: <Image src="/img/roadmap.svg" alt="road icon" />,
    title: "Our roadmap",
    description: (
      <p>
        Find out how we prioritize our work, see which components and patterns
        are planned for delivery in the coming months, and get updates about the
        Salt site and legacy UI Toolkit.
      </p>
    ),
    url: "./getting-started/roadmap",
    footerText: "View our planning schedule",
    keylineColor: "var(--site-tertiary-accent-orange)",
  },
];

const homePageInfo = [
  {
    id: "why-trust-us",
    summary: <h2>Why trust us?</h2>,
    details: (
      <>
        <p>In a nutshell, we’ve done this before.</p>
        <p>
          The team behind Salt created the J.P Morgan UI Toolkit, a design
          system that’s used and trusted by internal product owners, visual and
          UX designers, developers, content specialists and more.
        </p>
        <p>
          The UI Toolkit has a proven track record of increasing efficiency,
          ensuring design consistency and driving significant cost savings for
          product teams. It provides a robust component set, business patterns
          and sample apps as well as usage, design, content and accessibility
          guidance. All of this work is the foundation on which we plan to
          improve and migrate to Salt.
        </p>
        <p>
          Eventually, Salt will provide everything you need to create
          consistent, fully accessible, beautifully designed user interfaces.
        </p>
      </>
    ),
  },
  {
    id: "future-of-finance",
    summary: <h2>The future of financial user experiences</h2>,
    details: (
      <>
        <p>
          We believe that beautiful, responsive designs belong in financial
          applications. Complex interfaces, such as trading screens and
          data-heavy tables, are often challenging to design and development
          teams.
        </p>
        <p>We hope to bridge that gap.</p>
        <p>
          Salt components are tried and tested in the investment banking arena.
          Underpinned by beautiful and functional design, they support the
          creation of great user experiences across all devices—even in the
          financial sector.
        </p>
      </>
    ),
  },
  {
    id: "join-us",
    summary: <h2>Join us on this odyssey</h2>,
    details: (
      <>
        <p>
          This is our first foray into the public domain. But we have ambitious
          plans.
        </p>
        <p>
          Salt’s predecessor was built with multiple third-party dependencies,
          which added significant weight and complexity to our library. We’re
          rebuilding and enhancing each and every component—striving for
          accessibility, lightweight code and flexibility in theming and
          presentation.
        </p>
        <p>
          We’d love to share this journey with you, with your input and
          contributions informing and shaping our next steps.{" "}
          <Link href="./support-and-contributions">Get in touch</Link> to share
          your feedback.
        </p>
      </>
    ),
  },
];

const Homepage = (): JSX.Element => {
  return (
    <div>
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
        <HomepageAccordion homePageInfo={homePageInfo} />
      </main>
    </div>
  );
};

export default Homepage;
