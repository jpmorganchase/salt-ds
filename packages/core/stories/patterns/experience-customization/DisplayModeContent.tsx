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
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";
import HighDensityLight from "./img/high-light.png";
import MediumDensityLight from "./img/medium-light.png";

export const DisplayModeContent = ({
  formData,
  handleSelectChange,
}: FormContentProps) => {
  const displayDensityOptions = [
    {
      value: "medium",
      label: "Medium density",
      description: "Balanced spacing (Recommended)",
      image: MediumDensityLight,
      alt: "Medium Density Light",
    },
    {
      value: "high",
      label: "High density",
      description: "More content on screen",
      image: HighDensityLight,
      alt: "High Density Light",
    },
  ] as const;

  return (
    <StackLayout aria-live="polite">
      {formData.displayDensity === "high" && (
        <Banner status="warning">
          <BannerContent>
            High density may reduce readability and make some controls harder to
            use.{" "}
            <Link href="#">Read WCAG guidelines for more information.</Link>
          </BannerContent>
        </Banner>
      )}

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
                        src={option.image}
                        alt=""
                        style={{
                          height: 200,
                          width: "100%",
                          objectFit: "contain",
                        }}
                        aria-hidden
                      />
                      <StackLayout direction="row" gap={1}>
                        <RadioButtonIcon
                          aria-hidden
                          checked={formData.displayDensity === option.value}
                        />
                        <StackLayout gap={0}>
                          <Text>{option.label}</Text>
                          <Text color="secondary">{option.description}</Text>
                        </StackLayout>
                      </StackLayout>
                    </StackLayout>
                  </InteractableCard>
                </FlexItem>
              ))}
            </FlexLayout>
          </InteractableCardGroup>
        </FormField>
      </FlexItem>
    </StackLayout>
  );
};
