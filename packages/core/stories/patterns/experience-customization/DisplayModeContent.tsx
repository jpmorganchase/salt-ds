import {
  Display3,
  FlexItem,
  FormField,
  FormFieldLabel,
  InteractableCard,
  InteractableCardGroup,
  RadioButtonIcon,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";

export const DisplayModeContent = ({
  formData,

  handleSelectChange,
}: FormContentProps) => {
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Display mode</FormFieldLabel>
        <ToggleButtonGroup
          value={formData.displayMode}
          onChange={(event) => {
            handleSelectChange?.(event.currentTarget.value, "displayMode");
          }}
        >
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </FormField>

      <FlexItem>
        <FormField>
          <FormFieldLabel>Display density</FormFieldLabel>
          <InteractableCardGroup
            onChange={(_event, value) => {
              handleSelectChange?.(value as string, "displayDensity");
            }}
          >
            <InteractableCard value="high" style={{ width: "180px" }}>
              <StackLayout gap={1}>
                <StackLayout gap={1} direction="row" align="center">
                  <Display3>Sample text</Display3>
                </StackLayout>
                <StackLayout direction="row" gap={1}>
                  <RadioButtonIcon
                    aria-hidden
                    checked={formData.displayDensity === "high"}
                  />
                  <Text>High density</Text>
                </StackLayout>
              </StackLayout>
            </InteractableCard>
            <InteractableCard value="medium" style={{ width: "180px" }}>
              <StackLayout gap={1}>
                <StackLayout gap={1} direction="row" align="center">
                  <Display3>Sample text</Display3>
                </StackLayout>
                <StackLayout direction="row" gap={1}>
                  <RadioButtonIcon
                    aria-hidden
                    checked={formData.displayDensity === "medium"}
                  />
                  <Text>Medium density</Text>
                </StackLayout>
              </StackLayout>
            </InteractableCard>
          </InteractableCardGroup>
        </FormField>
      </FlexItem>
    </StackLayout>
  );
};
