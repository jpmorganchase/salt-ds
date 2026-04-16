import {
  Banner,
  BannerContent,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  InteractableCard,
  InteractableCardGroup,
  Link,
  RadioButtonIcon,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";
import HighDensityDark from "./img/high-dark.png";
import HighDensityLight from "./img/high-light.png";
import MediumDensityDark from "./img/medium-dark.png";
import MediumDensityLight from "./img/medium-light.png";

export const DisplayModeContent = ({
  formData,
  handleSelectChange,
  stepFieldValidation,
}: FormContentProps) => {
  const displayDensityOptions = [
    {
      value: "medium",
      label: "Medium density",
      lightImage: MediumDensityLight,
      darkImage: MediumDensityDark,
      alt: "Medium Density Light",
    },
    {
      value: "high",
      label: "High density",
      lightImage: HighDensityLight,
      darkImage: HighDensityDark,
      alt: "High Density Light",
    },
  ] as const;

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
              {displayDensityOptions.map((option) => (
                <FlexItem key={option.value}>
                  <InteractableCard value={option.value}>
                    <StackLayout gap={1}>
                      <img
                        src={
                          formData.displayMode === "light"
                            ? option.lightImage
                            : option.darkImage
                        }
                        alt={option.alt}
                        style={{
                          height: 200,
                          width: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <StackLayout direction="row" gap={1}>
                        <RadioButtonIcon
                          aria-hidden
                          checked={formData.displayDensity === option.value}
                        />
                        <Text>{option.label}</Text>
                      </StackLayout>
                    </StackLayout>
                  </InteractableCard>
                </FlexItem>
              ))}
            </FlexLayout>
          </InteractableCardGroup>
        </FormField>
      </FlexItem>

      {stepFieldValidation.displayDensity?.status && (
        <Banner status="warning">
          <BannerContent>
            High density may reduce readability and make some controls harder to
            use.{" "}
            <Link href="#">Read WCAG guidelines for more information.</Link>
          </BannerContent>
        </Banner>
      )}
    </StackLayout>
  );
};
