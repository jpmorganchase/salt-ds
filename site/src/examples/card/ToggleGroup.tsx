import { ReactElement } from "react";
import { InteractableCard, InteractableCardGroup } from "@salt-ds/lab";
import { H3, StackLayout, Text } from "@salt-ds/core";

export const ToggleGroup = (): ReactElement => (
  <InteractableCardGroup>
    <InteractableCard
      value="card"
      accent="top"
      style={{ width: "260px", height: "144px" }}
    >
      <StackLayout gap={1}>
        <H3>Card</H3>
        <Text>Make a payment by credit or debit card.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard
      value="debit"
      accent="top"
      style={{ width: "260px", height: "144px" }}
    >
      <StackLayout gap={1}>
        <H3>Direct Debit</H3>
        <Text>Set up a direct debit to pay monthly.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard
      value="cryptop"
      accent="top"
      style={{ width: "260px", height: "144px" }}
    >
      <StackLayout gap={1}>
        <H3>Cryptocurrency</H3>
        <Text>Pay with Bitcoin, Ethereum, etc.</Text>
      </StackLayout>
    </InteractableCard>
  </InteractableCardGroup>
);
