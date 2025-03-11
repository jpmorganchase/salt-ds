import { H1 } from "@salt-ds/core";
import type { FC } from "react";

import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import { Footer, Hero } from "../../components/index";
import { Search } from "../../components/search";
import styles from "./Landing.module.css";

export const Landing: FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <Hero />
        <div className={styles.middle}>
          <div className={styles.content}>
            <div className={styles.search}>
              <H1>Discover the power of Salt</H1>
              <Search
                aria-label="Search for components, guides and more."
                placeholder="Search for components, guides and more."
              />
            </div>
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
