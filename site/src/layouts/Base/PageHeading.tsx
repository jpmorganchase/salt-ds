import { H1, Text } from "@salt-ds/core";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { a, code, p, ul } from "../../components/index";
import styles from "./PageHeading.module.css";

const components = { code, ul, p, a } as any;

export interface PageHeadingProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  return (
    <div className={styles.root}>
      <H1 styleAs={"display4"}>{title}</H1>
      {description && (
        <Text className={styles.description}>
          <ReactMarkdown components={components}>{description}</ReactMarkdown>
        </Text>
      )}
      {children}
    </div>
  );
}
