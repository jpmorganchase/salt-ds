import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { Button } from "@jpmorganchase/uitk-core";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Button>
            {/* <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started"
          > */}
            Getting Started
            {/* </Link> */}
          </Button>
          <Link
            className="button button--secondary button--lg"
            to="/docs/components"
          >
            Components
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
    </Layout>
  );
}
