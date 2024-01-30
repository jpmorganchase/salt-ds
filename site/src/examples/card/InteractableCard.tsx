import { ReactElement } from "react";
import {
  InteractableCard as SaltInteractableCard,
  H3,
  Link,
  Text,
} from "@salt-ds/core";

export const InteractableCard = (): ReactElement => {
  return (
    <Link
      style={{ textDecoration: "none" }}
      href="https://saltdesignsystem.com/"
      IconComponent={null}
      target="_blank"
    >
      <SaltInteractableCard style={{ width: "256px" }}>
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </SaltInteractableCard>
    </Link>
  );
};
