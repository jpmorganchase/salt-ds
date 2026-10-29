import { Banner, BannerContent, H4, Text } from "@salt-ds/core";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Callout.module.css";

type CalloutProps = ComponentPropsWithoutRef<typeof Banner> & {
  title: string;
  children: ReactNode;
};

export const Callout = ({ title, children, ...rest }: CalloutProps) => {
  return (
    <Banner className={styles.root} {...rest}>
      <BannerContent className={styles.content}>
        {title && <H4>{title}</H4>}
        <Text className={styles.text}>{children}</Text>
      </BannerContent>
    </Banner>
  );
};
