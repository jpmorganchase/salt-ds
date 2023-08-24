import { ReactElement } from "react";
import { Card, H3, Text, Link } from "@salt-ds/core";

export const Actions = (): ReactElement => {
  return (
    <Card style={{ width: "256px" }}>
      <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
        <H3 styleAs="h3">Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </div>
      <Link href="#" IconComponent={null} target="_blank">
        View our range of funds
      </Link>
    </Card>
  );
};
