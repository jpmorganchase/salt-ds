import {
  Banner,
  BannerContent,
  Checkbox,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  Link,
  RadioButtonIcon,
  StackLayout,
  Text,
  useAriaAnnouncer,
  useId,
  useTheme,
} from "@salt-ds/core";
import { type Ref, type SyntheticEvent, useEffect, useRef } from "react";
import type { FormContentProps } from "./experience-customization.stories";
import HighDensityTable from "./img/table-high.png";
import HighDensityTableDark from "./img/table-high-dark.png";
import LowDensityTable from "./img/table-low.png";
import LowDensityTableDark from "./img/table-low-dark.png";
import MediumDensityTable from "./img/table-medium.png";
import MediumDensityTableDark from "./img/table-medium-dark.png";

const HIGH_DENSITY_WARNING_MESSAGE =
  "Warning: High density doesn't meet the WCAG-defined minimum target size, which may reduce readability and make interactions harder. (link provided in warning message above)";

const displayDensityOptions = [
  {
    value: "high",
    label: "High density",
    image: HighDensityTable,
    darkImage: HighDensityTableDark,
    alt: "High Density",
  },
  {
    value: "medium",
    label: "Medium density",
    image: MediumDensityTable,
    darkImage: MediumDensityTableDark,
    alt: "Medium Density",
  },
  {
    value: "low",
    label: "Low density",
    image: LowDensityTable,
    darkImage: LowDensityTableDark,
    alt: "Low Density",
  },
] as const;

export const FoundationContent = ({
  formData,
  onDensityChange,
  initialFocusRef,
  stepFieldValidation,
  handleCheckboxChange,
}: FormContentProps & {
  onDensityChange?: (value: string) => void;
  initialFocusRef?: Ref<HTMLDivElement>;
}) => {
  const { mode } = useTheme();
  const densityId = useId();
  const requiredDisclaimerField = useRef<HTMLDivElement>(null);

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (stepFieldValidation.acceptTerms?.status) {
      requiredDisclaimerField.current?.scrollIntoView();
    }
  }, [stepFieldValidation.acceptTerms?.status]);

  const handleOnChange = (
    _event: SyntheticEvent<HTMLDivElement, Event>,
    value: InteractableCardValue,
  ) => {
    onDensityChange?.(value as string);
    if (value === "high") {
      setTimeout(() => {
        announce(HIGH_DENSITY_WARNING_MESSAGE, {
          duration: 1000,
        });
      }, 0);
    }
  };

  return (
    <StackLayout>
      {formData.displayDensity === "high" && (
        <Banner status="warning">
          <BannerContent>
            High density doesn't meet the{" "}
            <Link
              href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html"
              target="_blank"
              rel="noopener"
            >
              WCAG-defined minimum target size
            </Link>
            , which may reduce readability and make interactions harder.
          </BannerContent>
        </Banner>
      )}
      {stepFieldValidation.displayDensity?.status && (
        <Banner status="error">
          <BannerContent>
            {stepFieldValidation.displayDensity.message}
          </BannerContent>
        </Banner>
      )}

      <FlexItem>
        <FormField>
          <FormFieldLabel id={densityId}>Choose a density</FormFieldLabel>
          <InteractableCardGroup
            aria-labelledby={densityId}
            value={formData.displayDensity}
            onChange={handleOnChange}
          >
            <GridLayout style={{ width: "100%" }} columns={{ xs: 1, sm: 3 }}>
              {displayDensityOptions.map((option) => (
                <InteractableCard
                  key={option.value}
                  value={option.value}
                  ref={
                    option.value === displayDensityOptions[0].value
                      ? initialFocusRef
                      : undefined
                  }
                >
                  <StackLayout gap={1}>
                    <img
                      src={mode === "dark" ? option.darkImage : option.image}
                      alt=""
                      aria-hidden
                      style={{
                        height: 200,
                        width: "100%",
                      }}
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
              ))}
            </GridLayout>
          </InteractableCardGroup>
        </FormField>
      </FlexItem>

      {formData.displayDensity === "high" && (
        <FormField
          necessity="required"
          validationStatus={stepFieldValidation.acceptTerms?.status}
          ref={requiredDisclaimerField}
        >
          <Checkbox
            name="acceptTerms"
            label="I understand that High density reduces target sizes and may affect readability and ease of use."
            checked={formData.acceptTerms}
            onChange={handleCheckboxChange}
            required
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
