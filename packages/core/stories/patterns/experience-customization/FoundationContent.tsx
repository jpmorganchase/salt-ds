import {
  Banner,
  BannerContent,
  Checkbox,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  InteractableCard,
  InteractableCardGroup,
  Link,
  RadioButtonIcon,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import type { FormContentProps } from "./experience-customization.stories";
import HighDensityTable from "./img/table-high.png";
import LowDensityTable from "./img/table-low.png";
import MediumDensityTable from "./img/table-medium.png";

export const FoundationContent = ({
  formData,
  handleSelectChange,
  stepFieldValidation,
  handleCheckboxChange,
}: FormContentProps) => {
  const displayDensityOptions = [
    {
      value: "high",
      label: "High density",
      image: HighDensityTable,
      alt: "High Density",
    },
    {
      value: "medium",
      label: "Medium density",
      image: MediumDensityTable,
      alt: "Medium Density",
    },
    {
      value: "low",
      label: "Low density",
      image: LowDensityTable,
      alt: "Low Density",
    },
  ] as const;

  const densityId = useId();

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
        <StackLayout gap={1}>
          <Text styleAs="label" id={densityId}>
            Choose a density
          </Text>
          <InteractableCardGroup
            aria-labelledby={densityId}
            value={formData.displayDensity}
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
                        </StackLayout>
                      </StackLayout>
                    </StackLayout>
                  </InteractableCard>
                </FlexItem>
              ))}
            </FlexLayout>
          </InteractableCardGroup>
        </StackLayout>
      </FlexItem>

      {formData.displayDensity === "high" && (
        <FormField
          necessity="required"
          validationStatus={stepFieldValidation.acceptTerms?.status}
        >
          <Checkbox
            name="acceptTerms"
            label="I understand that High density reduces target sizes and may affect readability and ease of use."
            checked={formData.acceptTerms}
            onChange={handleCheckboxChange}
          />
          {stepFieldValidation.acceptTerms?.status && (
            <FormFieldHelperText>
              {stepFieldValidation.acceptTerms.message}
            </FormFieldHelperText>
          )}
        </FormField>
      )}
    </StackLayout>
  );
};
