import {
  GridItem,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  RadioButtonIcon,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useState } from "react";

const NOTIFICATION_POSITIONS = [
  {
    value: "top-left",
    label: "Top Left",
  },
  {
    value: "top-right",
    label: "Top Right",
  },
  {
    value: "bottom-left",
    label: "Bottom Left",
  },
  {
    value: "bottom-right",
    label: "Bottom Right",
  },
];

const NotificationPosition = ({ position }: { position: string }) => {
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 10, left: 12 },
    "top-right": { top: 10, right: 12 },
    "bottom-left": { bottom: 10, left: 12 },
    "bottom-right": { bottom: 10, right: 12 },
  };

  return (
    <div
      style={{
        width: 225,
        height: 100,
        backgroundColor: "var(--salt-container-secondary-background)",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 18,
          width: 75,
          backgroundColor: "var(--salt-actionable-background-selected)",
          borderRadius: "var(--salt-palette-corner-weaker)",
          position: "absolute",
          ...positionStyles[position],
        }}
      />
    </div>
  );
};

export const NotificationsContent = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
    >
      <GridLayout
        padding={1}
        columns={2}
        rows={2}
        style={{
          margin: "0 auto",
        }}
      >
        {NOTIFICATION_POSITIONS.map(({ value, label }) => (
          <GridItem key={value}>
            <InteractableCard value={value} style={{ width: "180px" }}>
              <StackLayout gap={1}>
                <StackLayout gap={1} direction="row">
                  <NotificationPosition position={value} />
                </StackLayout>
                <StackLayout direction="row" gap={1}>
                  <RadioButtonIcon aria-hidden checked={selected === value} />
                  <Text>{label}</Text>
                </StackLayout>
              </StackLayout>
            </InteractableCard>
          </GridItem>
        ))}
      </GridLayout>
    </InteractableCardGroup>
  );
};
