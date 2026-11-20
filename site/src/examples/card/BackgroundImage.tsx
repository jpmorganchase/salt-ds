import { Card, CardContent, H3, Link, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const BackgroundImage = (): ReactElement => {
  return (
    <Card
      style={{
        backgroundImage: 'url("/img/examples/backgroundImg.png")',
        backgroundSize: "cover",
        // Make sure text meets color contrast standards in both light and dark
        // modes. The example image is dark, so the card's text and link use the
        // bold foreground color, which they inherit.
        color: "var(--salt-content-bold-foreground)",
      }}
    >
      <CardContent>
        <StackLayout align="start">
          <StackLayout gap={1}>
            <H3 color="inherit">Sustainable investing products</H3>
            <Text as="p" color="inherit">
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </StackLayout>
          <Link href="#" IconComponent={null} color="inherit">
            Learn more
          </Link>
        </StackLayout>
      </CardContent>
    </Card>
  );
};
