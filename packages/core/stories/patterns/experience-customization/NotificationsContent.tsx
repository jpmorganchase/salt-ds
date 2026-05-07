import {
  FlexItem,
  FlexLayout,
  InteractableCard,
  InteractableCardGroup,
  RadioButtonIcon,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";

export const NOTIFICATION_POSITIONS = [
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

export const NotificationPosition = ({ position }: { position: string }) => {
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 10, left: 5.5 },
    "top-right": { top: 10, right: 5.5 },
    "bottom-left": { bottom: 10, left: 5.5 },
    "bottom-right": { bottom: 10, right: 5.5 },
  };

  return (
    <div
      style={{
        width: 108,
        height: 100,
        backgroundColor: "var(--salt-container-secondary-background)",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 12,
          width: 29,
          backgroundColor: "var(--salt-actionable-background-selected)",
          borderRadius: "var(--salt-palette-corner-weaker)",
          position: "absolute",
          ...positionStyles[position],
        }}
      />
    </div>
  );
};

export const NotificationsContent = ({
  formData,
  handleSelectChange,
}: FormContentProps) => {
  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        handleSelectChange?.(value as string, "position");
      }}
    >
      <FlexLayout>
        {NOTIFICATION_POSITIONS.map(({ value, label }) => (
          <FlexItem key={value}>
            <InteractableCard
              value={value}
              style={{
                padding: "var(--salt-spacing-200)",
              }}
            >
              <StackLayout gap={1}>
                <StackLayout gap={1} direction="row">
                  <NotificationPosition position={value} />
                </StackLayout>
                <StackLayout direction="row" gap={1}>
                  <RadioButtonIcon
                    aria-hidden
                    checked={formData.position === value}
                  />
                  <Text>{label}</Text>
                </StackLayout>
              </StackLayout>
            </InteractableCard>
          </FlexItem>
        ))}
      </FlexLayout>
    </InteractableCardGroup>
  );
};
