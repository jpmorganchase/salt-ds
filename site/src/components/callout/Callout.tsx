import { Banner, BannerContent, H4, Text } from "@salt-ds/core";
import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type CalloutProps = { title: string; children: ReactNode };

export const Callout = ({ title, children }: CalloutProps) => {
  return (
    <Banner className={styles.root}>
      <BannerContent className={styles.content}>
        <H4>{title}</H4>
        <Text className={styles.text}>{children}</Text>
      </BannerContent>
    </Banner>
  );
};
