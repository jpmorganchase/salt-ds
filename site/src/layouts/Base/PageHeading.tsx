import { H1, Text } from "@salt-ds/core";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import styles from "./PageHeading.module.css";

const Markdown = dynamic(() => import("../../components/markdown/Markdown"));

export interface PageHeadingProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  id?: string;
}

export function PageHeading({
  title,
  description,
  children,
  id,
}: PageHeadingProps) {
  return (
    <div className={styles.root} id={id}>
      <div className={styles.content}>
        <H1 styleAs={"display4"}>{title}</H1>
        {description && (
          <Text className={styles.description}>
            <Markdown>{description}</Markdown>
          </Text>
        )}
        {children}
      </div>
    </div>
  );
}
