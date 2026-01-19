import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import { type ComboBoxProps, H1 } from "@salt-ds/core";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { Footer, Hero } from "../../components/index";
import styles from "./Landing.module.css";

const Search = dynamic<ComboBoxProps>(() =>
  import("../../components/search").then((mod) => mod.Search),
);

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
