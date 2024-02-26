import { ReactElement } from "react";
import { InteractableCard, InteractableCardGroup } from "@salt-ds/lab";
import { H3, StackLayout, Text } from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";

export const DisabledToggleGroup = (): ReactElement => (
  <StackLayout>
    <StackLayout gap={1}>
      <H3>Payment method</H3>
      <Text>Choose your payment method from the options below.</Text>
    </StackLayout>
    <InteractableCardGroup disabled value="card">
      <InteractableCard value="card" accent="top" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <CreditCardIcon size={2} />
            <H3 disabled>Credit Card</H3>
          </StackLayout>
          <Text disabled>Link credit card to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="wire" accent="top" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <BankIcon size={2} />
            <H3 disabled>Bank wire</H3>
          </StackLayout>
          <Text disabled>Link your bank to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="crypto" accent="top" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <DiamondIcon size={2} />
            <H3 disabled>Cryptocurrency</H3>
          </StackLayout>
          <Text disabled>Link your crypto to your payments account.</Text>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  </StackLayout>
);
