import {
  CardContent,
  H3,
  InteractableCard,
  InteractableCardGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const DisabledToggleGroup = (): ReactElement => (
  <StackLayout>
    <StackLayout gap={1}>
      <H3 style={{ margin: 0 }}>Payment method</H3>
      <Text>Choose your payment method from the options below.</Text>
    </StackLayout>
    <InteractableCardGroup disabled value="card">
      <InteractableCard value="card" style={{ width: "180px" }}>
        <CardContent>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <CreditCardIcon size={2} aria-hidden />
              <H3 disabled style={{ margin: 0 }}>
                Credit Card
              </H3>
            </StackLayout>
            <Text disabled>Link credit card to your payments account.</Text>
          </StackLayout>
        </CardContent>
      </InteractableCard>
      <InteractableCard value="wire" style={{ width: "180px" }}>
        <CardContent>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <BankIcon size={2} aria-hidden />
              <H3 disabled style={{ margin: 0 }}>
                Bank wire
              </H3>
            </StackLayout>
            <Text disabled>Link your bank to your payments account.</Text>
          </StackLayout>
        </CardContent>
      </InteractableCard>
      <InteractableCard value="crypto" style={{ width: "180px" }}>
        <CardContent>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <DiamondIcon size={2} aria-hidden />
              <H3 disabled style={{ margin: 0 }}>
                Cryptocurrency
              </H3>
            </StackLayout>
            <Text disabled>Link your crypto to your payments account.</Text>
          </StackLayout>
        </CardContent>
      </InteractableCard>
    </InteractableCardGroup>
  </StackLayout>
);
