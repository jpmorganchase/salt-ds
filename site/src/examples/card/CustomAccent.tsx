import { Card, H3, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const CustomAccent = (): ReactElement => {
  return (
    <StackLayout direction="row">
      {/* in your css:
        .category1 { 
          --saltCard-accent-color: rgb(70, 118, 191);
        }
        .category1:hover {
          --saltCard-accent-color: rgb(35, 77, 140);
        }
      */}
      <Card
        className={styles.category1}
        style={{
          width: "240px",
        }}
        accent="top"
        hoverable
      >
        <StackLayout gap={1}>
          <H3>
            <strong>Investment Compliance</strong>
          </H3>
          <Text>
            Exception-based reporting that highlights potential warnings or
            violations of investment guidelines and regulations.
          </Text>
        </StackLayout>
      </Card>
      {/* in your css:
        .category2 {
          --saltCard-accent-color: rgb(171, 101, 40);
        }

        .category2:hover {
          --saltCard-accent-color: rgb(133, 72, 20);
        }
      */}
      <Card
        className={styles.category2}
        style={{
          width: "240px",
        }}
        accent="top"
        hoverable
      >
        <StackLayout gap={1}>
          <H3>
            <strong>S&P Global Market Intelligence</strong>
          </H3>
          <Text>
            Automate transmission of bank loan settlement instructions.
          </Text>
        </StackLayout>
      </Card>
    </StackLayout>
  );
};
