import {
  CardContent,
  H3,
  InteractableCard,
  InteractableCardGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";
import { type ReactElement, useId } from "react";

export const SelectionGroup = (): ReactElement => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <StackLayout>
      <StackLayout gap={1}>
        <H3 id={labelId}>Payment method</H3>
        <Text as="p" id={descriptionId}>
          Choose your payment method from the options below.
        </Text>
      </StackLayout>
      <InteractableCardGroup
        aria-describedby={descriptionId}
        aria-labelledby={labelId}
      >
        <InteractableCard value="card" style={{ minWidth: "180px" }}>
          <CardContent>
            <StackLayout gap={1}>
              <StackLayout gap={1} direction="row" align="center">
                <CreditCardIcon size={2} aria-hidden />
                <H3>Credit Card</H3>
              </StackLayout>
              <Text as="p">Link credit card to your payments account.</Text>
            </StackLayout>
          </CardContent>
        </InteractableCard>
        <InteractableCard value="wire" style={{ minWidth: "180px" }}>
          <CardContent>
            <StackLayout gap={1}>
              <StackLayout gap={1} direction="row" align="center">
                <BankIcon size={2} aria-hidden />
                <H3>Bank wire</H3>
              </StackLayout>
              <Text as="p">Link your bank to your payments account.</Text>
            </StackLayout>
          </CardContent>
        </InteractableCard>
        <InteractableCard value="crypto" style={{ minWidth: "180px" }}>
          <CardContent>
            <StackLayout gap={1}>
              <StackLayout gap={1} direction="row" align="center">
                <DiamondIcon size={2} aria-hidden />
                <H3>Cryptocurrency</H3>
              </StackLayout>
              <Text as="p">Link your crypto to your payments account.</Text>
            </StackLayout>
          </CardContent>
        </InteractableCard>
      </InteractableCardGroup>
    </StackLayout>
  );
};
