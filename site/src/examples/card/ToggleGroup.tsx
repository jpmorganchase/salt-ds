import {
  H3,
  InteractableCard,
  InteractableCardGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleGroup = (): ReactElement => (
  <StackLayout>
    <StackLayout gap={1}>
      <H3>Payment method</H3>
      <Text>Choose your payment method from the options below.</Text>
    </StackLayout>
    <InteractableCardGroup>
      <InteractableCard value="card" style={{ minWidth: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <CreditCardIcon size={2} />
            <H3>Credit Card</H3>
          </StackLayout>
          <Text>Link credit card to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="wire" style={{ minWidth: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <BankIcon size={2} />
            <H3>Bank wire</H3>
          </StackLayout>
          <Text>Link your bank to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="crypto" style={{ minWidth: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <DiamondIcon size={2} />
            <H3>Cryptocurrency</H3>
          </StackLayout>
          <Text>Link your crypto to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  </StackLayout>
);
