import { ReactElement } from "react";
import { Card, FlexLayout, H3, StackLayout, Tag, Text } from "@salt-ds/core";
import styles from "./index.module.css";

export const TagInCard = (): ReactElement => (
  <Card
    className={styles.category3}
    style={{
      width: 315,
    }}
    accent="top"
  >
    <StackLayout>
      <StackLayout gap={1}>
        <H3>
          <strong>Bond Performance</strong>
        </H3>
        <Text>
          A snapshot of your bond investments: market value, yield, maturity
          dates, real-time interest rate changes, and credit ratings.
        </Text>
      </StackLayout>
      <FlexLayout direction="row" justify="end" gap={1}>
        <Tag category={4}>Coming soon</Tag>
        <Tag variant="secondary" category={3}>
          Bonds
        </Tag>
      </FlexLayout>
    </StackLayout>
  </Card>
);
