import {
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  RadioButtonIcon,
  StackLayout,
  Switch,
  Text,
  useId,
} from "@salt-ds/core";
import type { CSSProperties } from "react";
import type { FormContentProps } from "./experience-customization.stories";

export const NOTIFICATION_POSITIONS = [
  {
    value: "top-left",
    label: "Top left",
  },
  {
    value: "top-right",
    label: "Top right",
  },
  {
    value: "bottom-left",
    label: "Bottom left",
  },
  {
    value: "bottom-right",
    label: "Bottom right",
  },
];

export const NotificationPosition = ({ position }: { position: string }) => {
  const positionStyles: Record<string, CSSProperties> = {
    "top-left": { top: 10, left: 5.5 },
    "top-right": { top: 10, right: 5.5 },
    "bottom-left": { bottom: 10, left: 5.5 },
    "bottom-right": { bottom: 10, right: 5.5 },
  };

  return (
    <div
      style={{
        width: "100%",
        height: 100,
        backgroundColor: "var(--salt-container-secondary-background)",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 12,
          width: "30%",
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
  handleCheckboxChange,
  style,
}: FormContentProps & { style?: CSSProperties }) => {
  const titleId = useId();
  return (
    <StackLayout style={style}>
      <FormField>
        <FormFieldLabel id={titleId}>
          Choose a placement for notification
        </FormFieldLabel>
        <InteractableCardGroup
          aria-labelledby={titleId}
          value={formData.position}
          onChange={(_event, value) => {
            handleSelectChange?.(value as string, "position");
          }}
        >
          <GridLayout
            style={{ width: "100%" }}
            columns={{ xs: 1, sm: 2, md: 4 }}
            gap={3}
          >
            {NOTIFICATION_POSITIONS.map(({ value, label }) => (
              <GridItem key={value}>
                <InteractableCard value={value}>
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
              </GridItem>
            ))}
          </GridLayout>
        </InteractableCardGroup>
      </FormField>

      <FormField>
        <FormFieldLabel>Automatically dismiss notifications</FormFieldLabel>
        <Switch
          label={formData.autoDismiss ? "On" : "Off"}
          name="autoDismiss"
          checked={formData.autoDismiss}
          onChange={handleCheckboxChange}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Extend notification display time</FormFieldLabel>
        <Switch
          label={formData.extendDisplayTime ? "On" : "Off"}
          name="extendDisplayTime"
          checked={formData.extendDisplayTime}
          onChange={handleCheckboxChange}
        />
      </FormField>
    </StackLayout>
  );
};
