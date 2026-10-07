import {
  Avatar,
  CheckboxIcon,
  H3,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useState } from "react";

const persona1 = "/img/examples/avatar.png";

const persona2 = "/img/examples/avatar2.png";

const persona3 = "/img/examples/avatar3.png";

export const MultipleSelection = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
      multiSelect
    >
      <InteractableCard value="jane-doe" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} src={persona1} />
            <H3 style={{ margin: 0 }}>Jane Doe</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("jane-doe")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="tom-roberts" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} src={persona2} />
            <H3 style={{ margin: 0 }}>Tom Roberts</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("tom-roberts")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="ray-smith" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} src={persona3} />
            <H3 style={{ margin: 0 }}>Ray Smith</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("ray-smith")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};
