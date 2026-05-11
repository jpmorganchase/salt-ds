import {
  Banner,
  BannerContent,
  Checkbox,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  Link,
  RadioButtonIcon,
  StackLayout,
  Text,
  useId,
  useTheme,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import type { FormContentProps } from "./experience-customization.stories";
import HighDensityTable from "./img/table-high.png";
import HighDensityTableDark from "./img/table-high-dark.png";
import LowDensityTable from "./img/table-low.png";
import LowDensityTableDark from "./img/table-low-dark.png";
import MediumDensityTable from "./img/table-medium.png";
import MediumDensityTableDark from "./img/table-medium-dark.png";

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
  handleSelectChange,
  stepFieldValidation,
  handleCheckboxChange,
}: FormContentProps) => {
  const { mode } = useTheme();
  const densityId = useId();
  const warningBannerId = useId();
  const errorBannerId = useId();
  const requiredDisclaimerField = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepFieldValidation.acceptTerms?.status) {
      requiredDisclaimerField.current?.scrollIntoView();
    }
  }, [stepFieldValidation.acceptTerms?.status]);

  return (
    <StackLayout>
      {formData.displayDensity === "high" && (
        <Banner status="warning" id={warningBannerId}>
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
        <Banner status="error" id={errorBannerId}>
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
            onChange={(_event, value) => {
              handleSelectChange?.(value as string, "displayDensity");
            }}
          >
            <GridLayout style={{ width: "100%" }} columns={{ xs: 1, sm: 3 }}>
              {displayDensityOptions.map((option) => (
                <GridItem key={option.value}>
                  <InteractableCard
                    value={option.value}
                    aria-describedby={
                      clsx(
                        formData.displayDensity === "high" && warningBannerId,
                        stepFieldValidation.displayDensity?.status &&
                          errorBannerId,
                      ) || undefined
                    }
                  >
                    <StackLayout gap={1}>
                      <img
                        src={mode === "dark" ? option.darkImage : option.image}
                        alt=""
                        style={{
                          height: 200,
                          width: "100%",
                          // objectFit: "contain",
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
                </GridItem>
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
