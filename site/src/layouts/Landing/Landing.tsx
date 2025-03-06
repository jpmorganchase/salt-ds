import { Text } from "@salt-ds/core";
import type { FC } from "react";

import { Footer, Hero } from "../../components/index";
import { Search } from "../../components/search";
import type { LayoutProps } from "../types/index";
import styles from "./Landing.module.css";

export const Landing: FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <Hero />
        <div className={styles.middle}>
          <div className={styles.search}>
            <Text styleAs="h1">Discover the power of Salt</Text>
            <Search
              aria-label="Search for components, guides and more."
              placeholder="Search for components, guides and more."
            />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
