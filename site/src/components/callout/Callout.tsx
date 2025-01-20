import { Banner, BannerContent, H4, StackLayout, Text } from "@salt-ds/core";
import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type CalloutProps = { title: string; children: ReactNode };

export const Callout = ({ title, children }: CalloutProps) => {
  return (
    <Banner>
      <BannerContent>
        <StackLayout gap={1}>
          <H4>{title}</H4>
          <Text className={styles.content}>{children}</Text>
        </StackLayout>
      </BannerContent>
    </Banner>
  );
};
