import { Card, CardContent, H3, Link, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidthImage = (): ReactElement => {
  return (
    <Card style={{ width: "260px" }}>
      <img src="/img/examples/cardExample.jpg" alt="placeholder" />
      <CardContent>
        <StackLayout gap={1}>
          <H3 style={{ margin: 0 }}>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
          <Link href="#" IconComponent={null}>
            Learn more
          </Link>
        </StackLayout>
      </CardContent>
    </Card>
  );
};
