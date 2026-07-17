import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  H3,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Sections = (): ReactElement => (
  <Card style={{ width: "320px" }}>
    <CardHeader>
      <StackLayout gap={1}>
        <H3>Quarterly investment report</H3>
        <Text color="secondary">Updated 16 July 2026</Text>
      </StackLayout>
    </CardHeader>
    <CardContent>
      <Text>
        Review portfolio performance and the market changes that affected this
        quarter.
      </Text>
    </CardContent>
    <CardFooter>
      <Button>View report</Button>
    </CardFooter>
  </Card>
);
