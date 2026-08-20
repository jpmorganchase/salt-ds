import {
  Card,
  CardContent,
  FlowLayout,
  H3,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const CustomAccent = (): ReactElement => {
  return (
    <FlowLayout>
      {/* In your CSS:
        .category1 {
          --saltCard-accent-color: var(--salt-category-1-borderColor);
        }
      */}
      <Card
        className={styles.category1}
        style={{
          width: "240px",
        }}
        accent="top"
      >
        <CardContent>
          <StackLayout gap={1}>
            <H3 style={{ margin: 0 }}>Investment Compliance</H3>
            <Text>
              Exception-based reporting that highlights potential warnings or
              violations of investment guidelines and regulations.
            </Text>
          </StackLayout>
        </CardContent>
      </Card>
      {/* In your CSS:
        .category2 {
          --saltCard-accent-color: var(--salt-category-2-borderColor);
        }
      */}
      <Card
        className={styles.category2}
        style={{
          width: "240px",
        }}
        accent="top"
      >
        <CardContent>
          <StackLayout gap={1}>
            <H3 style={{ margin: 0 }}>S&P Global Market Intelligence</H3>
            <Text>
              Automate transmission of bank loan settlement instructions.
            </Text>
          </StackLayout>
        </CardContent>
      </Card>
    </FlowLayout>
  );
};
