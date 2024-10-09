import { Image } from "@jpmorganchase/mosaic-site-components";
import { Card, CardContent, H3, Link, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidthImage = (): ReactElement => {
  return (
    <Card style={{ width: "260px" }}>
      <Image
        src="/img/examples/cardExample.jpg"
        alt="placeholder image"
        style={{ width: "100%" }}
      />
      <CardContent>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
        <Link href="#" IconComponent={null}>
          Learn more
        </Link>
      </CardContent>
    </Card>
  );
};
