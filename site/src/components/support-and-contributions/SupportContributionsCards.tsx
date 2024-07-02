import { GridLayout } from "@salt-ds/core";
import type { ReactNode } from "react";

import styles from "./SupportContributionsCards.module.css";

export const SupportContributionsCards = ({
  children,
}: {
  children: ReactNode;
}) => (
  <div className={styles.supportContributionsCards}>
    <GridLayout
      columns={{
        xs: 1,
        md: 2,
      }}
      gap={3}
      rows={2}
    >
      {children}
    </GridLayout>
  </div>
);
