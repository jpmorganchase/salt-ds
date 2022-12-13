import React from "react";
import Layout from "@theme/Layout";
import styles from "./notfound.module.css";
import Link from "@docusaurus/Link";
import { PageMetadata } from "@docusaurus/theme-common";

export default function NotFound() {
  return (
    <>
      <PageMetadata title="Page Not Found" />
      <Layout>
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundContent}>
            <h2 className={styles.heroTitle}>404 error</h2>
            <p className={styles.errorText}>
              This page doesn't exist. <Link href="./">Find your way home</Link>
              .
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}
