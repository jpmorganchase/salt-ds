import {
  Button,
  Card,
  CardContent,
  CardFooter,
  H3,
  Link,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Actions = (): ReactElement => {
  return (
    <StackLayout direction={"row"} align="start">
      <Card style={{ width: "260px" }} accent="top">
        <CardContent>
          <StackLayout gap={1}>
            <H3 style={{ margin: 0 }}>Sustainable investing products</H3>
            <Text>
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </StackLayout>
        </CardContent>
        <CardFooter>
          <Button>Learn more</Button>
        </CardFooter>
      </Card>
      <Card style={{ width: "260px" }} accent="top">
        <CardContent>
          <StackLayout gap={1}>
            <H3 style={{ margin: 0 }}>Climate change</H3>
            <Text>
              Climate factors represent the biggest source of risk and
              opportunity for investors in the decades to come.
            </Text>
          </StackLayout>
        </CardContent>
        <CardFooter>
          <Link href="#">See our approach</Link>
        </CardFooter>
      </Card>
    </StackLayout>
  );
};
