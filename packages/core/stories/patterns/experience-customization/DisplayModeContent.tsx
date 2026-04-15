import {
  FlexItem,
  FlexLayout,
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
import HighDensityDark from "./img/high-dark.png";
import HighDesityLight from "./img/high-light.png";
import MediumDensityDark from "./img/medium-dark.png";
import MediumDensityLight from "./img/medium-light.png";

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
            <FlexLayout>
              <FlexItem>
                <InteractableCard value="medium">
                  <StackLayout gap={1}>
                    <StackLayout gap={1} direction="row">
                      <img
                        src={
                          formData.displayMode === "light"
                            ? MediumDensityLight
                            : MediumDensityDark
                        }
                        alt="Medium Density Light"
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "contain",
                        }}
                      />
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
              </FlexItem>
              <FlexItem>
                <InteractableCard value="high">
                  <StackLayout gap={1}>
                    <StackLayout gap={1} direction="row">
                      <img
                        src={
                          formData.displayMode === "light"
                            ? HighDesityLight
                            : HighDensityDark
                        }
                        alt="High Density Light"
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "contain",
                        }}
                      />
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
              </FlexItem>
            </FlexLayout>
          </InteractableCardGroup>
        </FormField>
      </FlexItem>
    </StackLayout>
  );
};
