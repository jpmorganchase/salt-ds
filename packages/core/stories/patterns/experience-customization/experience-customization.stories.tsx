import {
  type AnnounceFnOptions,
  AriaAnnouncerProvider,
  Banner,
  BannerContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H3,
  Link,
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  Switch,
  Text,
  useAriaAnnouncer,
  useResponsiveProp,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type ElementType,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Yup from "yup";
import { ContentOverflow } from "../wizard/ContentOverflow";
import { type FieldValidation, useWizardForm } from "../wizard/useWizardForm";
import { getStepStage, validateStep } from "../wizard/utils";
import { DataFormatContent } from "./DataFormatContent";
import { FoundationContent } from "./FoundationContent";
import { NotificationsContent } from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import "../wizard/ContentOverflow.css";
import { MandatoryConfigurationsContent } from "./MandatoryConfigurationsContent";

export default {
  title: "Patterns/Experience Customization",
  parameters: {
    layout: "padded",
  },
} as Meta;

export interface ECFormData {
  acceptTerms: boolean;
  language: string;
  region: string;
  publicHolidayCalendar: string;
  position: string;
  displayDensity: string;
  stockNameDisplay: string;
  exchangeAndRegionDisplay: string;
  visibleMetrics: string;
  performanceChart: boolean;
  autoDismiss: boolean;
  extendDisplayTime: boolean;
  firstDayOfWeek?: string;
  timeFormat?: string;
  measurementSystem?: string;
}

export interface FormContentProps {
  formData: ECFormData;
  handleInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  stepFieldValidation: Record<string, FieldValidation>;
  handleSelectChange?: (value: string, name: string) => void;
  handleRadioChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const interactiveElementSelector = [
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "a[href]",
  '[role="radio"][tabindex="0"]:not([aria-disabled="true"])',
  '[role="checkbox"][tabindex="0"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([role="region"])',
].join(", ");

const getStepAnnouncement = (stepIndex: number) => {
  const step = wizardSteps[stepIndex];

  return `${step.label}, step ${stepIndex + 1} of ${wizardSteps.length}`;
};

const focusFirstInteractiveElement = (container: HTMLElement | null) => {
  const firstInteractive = container?.querySelector<HTMLElement>(
    interactiveElementSelector,
  );

  firstInteractive?.focus();
};

const wizardSteps = [
  {
    id: "foundation",
    label: "Foundation",
    stepTitle: "Foundation",
  },
  { id: "regional", label: "Regional", stepTitle: "Regional" },
  {
    id: "dataFormat",
    label: "Data format",
    stepTitle: "Data format",
  },
  {
    id: "notifications",
    label: "Notification delivery",
    stepTitle: "Notifications",
  },
] as const;
const stepIds = wizardSteps.map((s) => s.id);

const initialFormData: ECFormData = {
  // Foundation
  displayDensity: "",
  acceptTerms: false,
  // Regional
  language: "",
  region: "",
  publicHolidayCalendar: "",
  firstDayOfWeek: "sunday",
  timeFormat: "12-hour",
  measurementSystem: "metric",
  // Data format
  stockNameDisplay: "fullNameTicker",
  exchangeAndRegionDisplay: "both",
  visibleMetrics: "lastPrice",
  performanceChart: true,
  // Notifications
  position: "top-right",
  autoDismiss: false,
  extendDisplayTime: false,
};

const defaultDataFormatValues = {
  stockNameDisplay: initialFormData.stockNameDisplay,
  exchangeAndRegionDisplay: initialFormData.exchangeAndRegionDisplay,
  visibleMetrics: initialFormData.visibleMetrics,
  performanceChart: initialFormData.performanceChart,
} as const;

const hasDataFormatChanges = (formData: ECFormData) => {
  return (
    formData.stockNameDisplay !== defaultDataFormatValues.stockNameDisplay ||
    formData.exchangeAndRegionDisplay !==
      defaultDataFormatValues.exchangeAndRegionDisplay ||
    formData.visibleMetrics !== defaultDataFormatValues.visibleMetrics ||
    formData.performanceChart !== defaultDataFormatValues.performanceChart
  );
};

const resetDataFormatFields = (
  updateField: (name: string, value: string | boolean) => void,
) => {
  updateField("stockNameDisplay", defaultDataFormatValues.stockNameDisplay);
  updateField(
    "exchangeAndRegionDisplay",
    defaultDataFormatValues.exchangeAndRegionDisplay,
  );
  updateField("visibleMetrics", defaultDataFormatValues.visibleMetrics);
  updateField("performanceChart", defaultDataFormatValues.performanceChart);
};

const getDensityFormUpdates = (
  displayDensity: string,
): Partial<ECFormData> => ({
  displayDensity,
  ...(displayDensity === "high" ? {} : { acceptTerms: false }),
});

const stepValidationSchemas: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  Yup.ObjectSchema<Record<string, any>>
> = {
  foundation: Yup.object({
    displayDensity: Yup.string().required("Choose one option to continue."),
    acceptTerms: Yup.boolean().when("displayDensity", {
      is: "high",
      // biome-ignore lint/suspicious/noThenProperty: This is the correct Yup syntax for conditional validation.
      then: (schema) =>
        schema.oneOf([true], "Please check the box to continue."),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
  regional: Yup.object({
    language: Yup.string().required("Language is required."),
  }),
};

export const StandardControls = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <RegionalSettingsContent
        formData={formData}
        handleRadioChange={handleRadioChange}
        handleSelectChange={handleSelectChange}
        stepFieldValidation={{}}
      />
    </div>
  );
};

export const CardSelection = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <NotificationsContent
      formData={formData}
      handleCheckboxChange={handleCheckboxChange}
      handleSelectChange={handleSelectChange}
      stepFieldValidation={{}}
      style={{ maxWidth: 700 }}
    />
  );
};

export const DynamicLivePreview = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 752 }}>
      <DataFormatContent
        formData={formData}
        handleRadioChange={handleRadioChange}
        handleCheckboxChange={handleCheckboxChange}
        stepFieldValidation={{}}
      />
    </div>
  );
};

const announceValidationErrors = (
  fields: Record<string, FieldValidation>,
  announce: (message: string, options?: AnnounceFnOptions) => void,
  options?: AnnounceFnOptions,
) => {
  const messages = Object.values(fields)
    .filter((f) => f.status === "error" && f.message)
    .map((f) => f.message as string);
  if (messages.length > 0) {
    announce(messages.join(". "), { ariaLive: "assertive", ...options });
  }
};

export const EndToEnd = () => {
  const stepContentRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
    updateFieldsWithoutValidation,
    clearFieldValidation,
    nextWithoutValidation,
    previous,
    reset,
    runValidationAndStore,
  } = useWizardForm({
    steps: stepIds,
    initialState: {
      activeStepIndex: 0,
      formData: initialFormData,
      validationsByStep: {},
    },
    validateStep: (stepId, data) =>
      validateStep(stepValidationSchemas, stepId, data),
  });
  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;

    focusFirstInteractiveElement(stepContentRef.current);
    announce(getStepAnnouncement(activeStepIndex));
  }, [activeStepIndex, announce]);

  const handleNext = async () => {
    const { valid, fields } = await runValidationAndStore();
    if (!valid) {
      announceValidationErrors(fields, announce);
      return;
    }
    if (isLastStep) {
      return;
    }

    navigatedRef.current = true;
    nextWithoutValidation();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const handleDensityChange = (value: string) => {
    updateFieldsWithoutValidation(getDensityFormUpdates(value));
    clearFieldValidation(currentStepId, "displayDensity");
    clearFieldValidation(currentStepId, "acceptTerms");
  };

  const handleFoundationCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFieldsWithoutValidation({ [e.target.name]: e.target.checked });
    clearFieldValidation(currentStepId, e.target.name);
  };

  const sharedFormProps: FormContentProps = {
    formData,
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value, name) => updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    foundation: (
      <FoundationContent
        {...sharedFormProps}
        handleCheckboxChange={handleFoundationCheckboxChange}
        onDensityChange={handleDensityChange}
      />
    ),
    regional: <RegionalSettingsContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} tickerAs="h2" />,
    notifications: <NotificationsContent {...sharedFormProps} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <div>
          <Text as="h1" styleAs="h2" style={{ margin: 0 }}>
            <Text color="primary">Customize your experience</Text>
            {wizardSteps[activeStepIndex].label}
          </Text>
          {wizardSteps[activeStepIndex].id === "foundation" && (
            <Text
              color="secondary"
              style={{
                marginTop: "var(--salt-spacing-50)",
              }}
            >
              A selection is required to proceed
            </Text>
          )}
        </div>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper
          orientation="horizontal"
          aria-label="Customize your experience steps"
        >
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              label={step.stepTitle}
              status={validationsByStep[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
            />
          ))}
        </Stepper>
      </FlexItem>
    </FlexLayout>
  );

  const cancel = (
    <Button sentiment="accented" appearance="transparent" onClick={reset}>
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish and apply changes" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const endFooter = (
    <FlexLayout gap={1}>
      {cancel}
      {prevBtn}
      {nextBtn}
    </FlexLayout>
  );

  const handleResetToDefault = () => {
    resetDataFormatFields(updateField);
    focusFirstInteractiveElement(stepContentRef.current);
    announce("Data format settings have been reset to default values.");
  };

  const startFooter =
    currentStepId === "dataFormat" &&
    hasDataFormatChanges(formData as ECFormData) ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={handleResetToDefault}
      >
        Reset to default
      </Button>
    ) : null;

  const footer =
    direction === "column" ? (
      <StackLayout gap={1} style={{ width: "100%" }} padding={3}>
        {nextBtn}
        {prevBtn}
        {cancel}
        {startFooter}
      </StackLayout>
    ) : (
      <SplitLayout padding={3} startItem={startFooter} endItem={endFooter} />
    );

  return (
    <StackLayout
      style={{
        maxWidth: 730,
        backgroundColor: "var(--salt-container-primary-background)",
      }}
      gap={0}
    >
      <FlexItem padding={3}>{header}</FlexItem>
      <FlexItem grow={1}>
        <ContentOverflow style={{ height: 430 }}>
          <div ref={stepContentRef}>{contentByStep[currentStepId]}</div>
        </ContentOverflow>
      </FlexItem>
      <FlexItem>{footer}</FlexItem>
    </StackLayout>
  );
};

const EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET =
  "experience-customization-modal";

export const EndToEndModal = () => {
  const [open, setOpen] = useState(false);
  const headingRef = useRef<HTMLElement | null>(null);

  const openWizard = () => {
    setOpen(true);
  };

  const closeWizard = () => {
    setOpen(false);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  return (
    <>
      <Button onClick={openWizard} aria-haspopup="dialog">
        Open experience customization
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        initialFocus={headingRef}
        style={{ height: 588 }}
      >
        <AriaAnnouncerProvider
          target={EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET}
        >
          <EndToEndModalContent
            closeWizard={closeWizard}
            setHeadingRef={(node) => {
              headingRef.current = node;
            }}
          />
        </AriaAnnouncerProvider>
      </Dialog>
    </>
  );
};

function EndToEndModalContent({
  closeWizard,
  setHeadingRef,
}: {
  closeWizard: () => void;
  setHeadingRef: (node: HTMLSpanElement | null) => void;
}) {
  const stepContentRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);

  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
    updateFieldsWithoutValidation,
    clearFieldValidation,
    nextWithoutValidation,
    previous,
    reset,
    runValidationAndStore,
  } = useWizardForm({
    steps: stepIds,
    initialState: {
      activeStepIndex: 0,
      formData: initialFormData,
      validationsByStep: {},
    },
    validateStep: (stepId, data) =>
      validateStep(stepValidationSchemas, stepId, data),
  });

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;

    focusFirstInteractiveElement(stepContentRef.current);
    announce(getStepAnnouncement(activeStepIndex), {
      target: EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET,
    });
  }, [activeStepIndex, announce]);

  const closeWizardAndReset = () => {
    closeWizard();
    setTimeout(() => {
      reset();
    }, 300);
  };

  const handleNext = async () => {
    const { valid, fields } = await runValidationAndStore();
    if (!valid) {
      announceValidationErrors(fields, announce, {
        target: EXPERIENCE_CUSTOMIZATION_MODAL_ANNOUNCER_TARGET,
      });
      return;
    }
    if (isLastStep) {
      closeWizardAndReset();
      return;
    }

    navigatedRef.current = true;
    nextWithoutValidation();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const handleDensityChange = (value: string) => {
    updateFieldsWithoutValidation(getDensityFormUpdates(value));
    clearFieldValidation(currentStepId, "displayDensity");
    clearFieldValidation(currentStepId, "acceptTerms");
  };

  const handleFoundationCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFieldsWithoutValidation({ [e.target.name]: e.target.checked });
    clearFieldValidation(currentStepId, e.target.name);
  };

  const sharedFormProps: FormContentProps = {
    formData,
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value, name) => updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    foundation: (
      <FoundationContent
        {...sharedFormProps}
        handleCheckboxChange={handleFoundationCheckboxChange}
        onDensityChange={handleDensityChange}
      />
    ),
    regional: <RegionalSettingsContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
  };

  const cancel = (
    <Button
      sentiment="accented"
      appearance="transparent"
      onClick={closeWizardAndReset}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish and apply changes" : "Next"}
    </Button>
  );

  const prevBtn = !isFirstStep && (
    <Button sentiment="accented" appearance="bordered" onClick={handlePrevious}>
      Previous
    </Button>
  );

  const endFooter = (
    <FlexLayout gap={1}>
      {cancel}
      {prevBtn}
      {nextBtn}
    </FlexLayout>
  );

  const handleResetToDefault = () => {
    resetDataFormatFields(updateField);
    focusFirstInteractiveElement(stepContentRef.current);
    announce("Data format settings have been reset to default values.");
  };

  const startFooter =
    currentStepId === "dataFormat" &&
    hasDataFormatChanges(formData as ECFormData) ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={handleResetToDefault}
      >
        Reset to default
      </Button>
    ) : null;

  const footer =
    direction === "column" ? (
      <StackLayout gap={1} style={{ width: "100%" }}>
        {nextBtn}
        {prevBtn}
        {cancel}
        {startFooter}
      </StackLayout>
    ) : (
      <SplitLayout padding={0} startItem={startFooter} endItem={endFooter} />
    );

  return (
    <>
      <DialogHeader
        header={
          <span ref={setHeadingRef} tabIndex={-1}>
            {wizardSteps[activeStepIndex].label}
          </span>
        }
        preheader="Customize your experience"
        actions={
          <Stepper
            orientation="horizontal"
            aria-label="Customize your experience steps"
          >
            {wizardSteps.map((step, index) => (
              <Step
                key={step.id}
                label={step.stepTitle}
                status={validationsByStep[step.id]?.status}
                stage={getStepStage(index, activeStepIndex)}
              />
            ))}
          </Stepper>
        }
        description={
          wizardSteps[activeStepIndex].id === "foundation" &&
          "A selection is required to proceed"
        }
      />
      <DialogContent ref={stepContentRef}>
        {contentByStep[currentStepId]}
      </DialogContent>
      <DialogActions>{footer}</DialogActions>
    </>
  );
}

export const MandatoryConfigurations = () => {
  return (
    <AriaAnnouncerProvider>
      <MandatoryConfigurationsContent />
    </AriaAnnouncerProvider>
  );
};

function PreferencesNavigation({
  items,
  location,
  onChange,
}: {
  items: string[];
  location: string;
  onChange: (location: string) => void;
}) {
  return (
    <VerticalNavigation
      aria-label="Experience customization sidebar"
      appearance="bordered"
      style={{ minWidth: "30ch" }}
    >
      {items.map((item) => (
        <VerticalNavigationItem key={item} active={location === item}>
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger
              onClick={() => onChange(item)}
              render={<button type="button" />}
            >
              <VerticalNavigationItemLabel>{item}</VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
}

type PreferenceSection =
  | "Foundation"
  | "Regional"
  | "Data format"
  | "Notification delivery";

interface PreferenceDialogFormData {
  displayDensity: string;
  acceptTerms: boolean;
  language: string;
  region: string;
  publicHolidayCalendar: string;
  firstDayOfWeek: string;
  timeFormat: string;
  measurementSystem: string;
  stockNameDisplay: string;
  exchangeAndRegionDisplay: string;
  visibleMetrics: string;
  performanceChart: boolean;
  position: string;
  autoDismiss: boolean;
  extendDisplayTime: boolean;
}

function PreferencesContent({
  currentSection,
  formData,
  onDropdownChange,
  onSwitchChange,
  onRadioChange,
}: {
  currentSection: PreferenceSection;
  formData: PreferenceDialogFormData;
  onDropdownChange: (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => void;
  onSwitchChange: (
    field: keyof PreferenceDialogFormData,
    checked: boolean,
  ) => void;
  onRadioChange: (field: keyof PreferenceDialogFormData, value: string) => void;
}) {
  let content;

  if (currentSection === "Foundation") {
    content = (
      <StackLayout gap={3}>
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
        <FormField>
          <FormFieldLabel>Choose a density</FormFieldLabel>
          <RadioButtonGroup
            value={formData.displayDensity}
            onChange={(event) =>
              onRadioChange("displayDensity", event.target.value)
            }
            direction="horizontal"
          >
            <RadioButton label="High density" value="high" />
            <RadioButton label="Medium density" value="medium" />
            <RadioButton label="Low density" value="low" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Regional") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Choose a language</FormFieldLabel>
          <Dropdown
            bordered
            placeholder="Select"
            value={formData.language}
            onSelectionChange={(_event, value) =>
              onDropdownChange("language", value[0])
            }
          >
            <Option value="English">English</Option>
            <Option value="Spanish">Spanish</Option>
            <Option value="French">French</Option>
            <Option value="German">German</Option>
            <Option value="Italian">Italian</Option>
            <Option value="Portuguese">Portuguese</Option>
            <Option value="Chinese (Simplified)">Chinese (Simplified)</Option>
            <Option value="Chinese (Traditional)">Chinese (Traditional)</Option>
            <Option value="Japanese">Japanese</Option>
            <Option value="Korean">Korean</Option>
            <Option value="Arabic">Arabic</Option>
            <Option value="Hindi">Hindi</Option>
          </Dropdown>
        </FormField>
        <FormField>
          <FormFieldLabel>Region/Country</FormFieldLabel>
          <Dropdown
            bordered
            placeholder="Select"
            value={formData.region}
            onSelectionChange={(_event, value) =>
              onDropdownChange("region", value[0])
            }
          >
            <Option value="United States">United States</Option>
            <Option value="Canada">Canada</Option>
            <Option value="United Kingdom">United Kingdom</Option>
            <Option value="Ireland">Ireland</Option>
            <Option value="France">France</Option>
            <Option value="Germany">Germany</Option>
            <Option value="Spain">Spain</Option>
            <Option value="Italy">Italy</Option>
            <Option value="Netherlands">Netherlands</Option>
            <Option value="Switzerland">Switzerland</Option>
            <Option value="India">India</Option>
            <Option value="Japan">Japan</Option>
            <Option value="Singapore">Singapore</Option>
            <Option value="Australia">Australia</Option>
          </Dropdown>
        </FormField>
        <FormField>
          <FormFieldLabel>Public holiday calendar</FormFieldLabel>
          <Dropdown
            bordered
            placeholder="Select"
            value={formData.publicHolidayCalendar}
            onSelectionChange={(_event, value) =>
              onDropdownChange("publicHolidayCalendar", value[0])
            }
          >
            <Option value="None">None (don't apply public holidays)</Option>
            <Option value="Selected country">Selected country</Option>
            <Option value="United States (Federal)">
              United States (Federal)
            </Option>
            <Option value="United Kingdom (England & Wales)">
              United Kingdom (England & Wales)
            </Option>
            <Option value="Canada (Federal)">Canada (Federal)</Option>
            <Option value="India (National)">India (National)</Option>
            <Option value="Japan (National)">Japan (National)</Option>
            <Option value="Australia (National)">Australia (National)</Option>
          </Dropdown>
        </FormField>
        <FormField>
          <FormFieldLabel>First day of the week</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.firstDayOfWeek}
            onChange={(event) =>
              onRadioChange("firstDayOfWeek", event.target.value)
            }
          >
            <RadioButton label="Sunday" value="sunday" />
            <RadioButton label="Monday" value="monday" />
            <RadioButton label="Saturday" value="saturday" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Time format</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.timeFormat}
            onChange={(event) =>
              onRadioChange("timeFormat", event.target.value)
            }
          >
            <RadioButton label="12-hour" value="12-hour" />
            <RadioButton label="24-hour" value="24-hour" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Measurement system</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.measurementSystem}
            onChange={(event) =>
              onRadioChange("measurementSystem", event.target.value)
            }
          >
            <RadioButton label="Metric" value="metric" />
            <RadioButton label="Imperial" value="imperial" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Data format") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Stock name display</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.stockNameDisplay}
            onChange={(event) =>
              onRadioChange("stockNameDisplay", event.target.value)
            }
          >
            <RadioButton label="Ticker only" value="tickerOnly" />
            <RadioButton label="Ticker and full name" value="fullNameTicker" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Exchange and region</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.exchangeAndRegionDisplay}
            onChange={(event) =>
              onRadioChange("exchangeAndRegionDisplay", event.target.value)
            }
          >
            <RadioButton label="Text only" value="text" />
            <RadioButton label="Flag only" value="flag" />
            <RadioButton label="Both" value="both" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Visible metrics</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.visibleMetrics}
            onChange={(event) =>
              onRadioChange("visibleMetrics", event.target.value)
            }
          >
            <RadioButton label="Last price" value="lastPrice" />
            <RadioButton label="Absolute change" value="absolute" />
            <RadioButton label="Market Cap" value="marketCap" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Performance chart</FormFieldLabel>
          <Switch
            checked={formData.performanceChart}
            onChange={(event) =>
              onSwitchChange("performanceChart", event.target.checked)
            }
            label={formData.performanceChart ? "Visible" : "Hidden"}
          />
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Notification delivery") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Choose a placement for notification</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.position}
            onChange={(event) => onRadioChange("position", event.target.value)}
          >
            <RadioButton label="Top left" value="Top left" />
            <RadioButton label="Top right" value="Top right" />
            <RadioButton label="Bottom left" value="Bottom left" />
            <RadioButton label="Bottom right" value="Bottom right" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Automatically dismiss notifications</FormFieldLabel>
          <Switch
            label={formData.autoDismiss ? "On" : "Off"}
            name="autoDismiss"
            checked={formData.autoDismiss}
            onChange={(event) =>
              onSwitchChange("autoDismiss", event.target.checked)
            }
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Extend notification display time</FormFieldLabel>
          <Switch
            label={formData.extendDisplayTime ? "On" : "Off"}
            name="extendDisplayTime"
            checked={formData.extendDisplayTime}
            onChange={(event) =>
              onSwitchChange("extendDisplayTime", event.target.checked)
            }
          />
        </FormField>
      </StackLayout>
    );
  }

  return (
    <StackLayout>
      <H3 style={{ margin: 0 }}>{currentSection}</H3>
      <div>{content}</div>
    </StackLayout>
  );
}

export const PreferenceDialog = () => {
  const sections: PreferenceSection[] = [
    "Foundation",
    "Regional",
    "Data format",
    "Notification delivery",
  ];
  const [currentSection, setCurrentSection] = useState<PreferenceSection>(
    sections[0],
  );
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<"parent" | "child">("parent");
  const [formData, setFormData] = useState<PreferenceDialogFormData>({
    displayDensity: "medium",
    acceptTerms: false,
    language: "English",
    region: "United States",
    publicHolidayCalendar: "Selected country",
    firstDayOfWeek: "monday",
    timeFormat: "24-hour",
    measurementSystem: "metric",
    stockNameDisplay: "fullNameTicker",
    exchangeAndRegionDisplay: "both",
    visibleMetrics: "lastPrice",
    performanceChart: true,
    position: "Top right",
    autoDismiss: false,
    extendDisplayTime: false,
  });

  const handleSectionChange = (section: string) => {
    setView("child");
    setCurrentSection(section as PreferenceSection);
  };

  const handleDropdownChange = (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (
    field: keyof PreferenceDialogFormData,
    checked: boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleRadioChange = (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
        Open preferences dialog
      </Button>
      <Dialog style={{ minHeight: "60%" }} open={open} onOpenChange={setOpen}>
        <DialogHeader header="Preferences" />
        <DialogContent>
          <ParentChildLayout
            gap={3}
            onCollapseChange={(newCollapsed) => setCollapsed(newCollapsed)}
            visibleView={view}
            parent={
              <PreferencesNavigation
                items={sections}
                location={currentSection}
                onChange={handleSectionChange}
              />
            }
            child={
              <PreferencesContent
                currentSection={currentSection}
                formData={formData}
                onDropdownChange={handleDropdownChange}
                onSwitchChange={handleSwitchChange}
                onRadioChange={handleRadioChange}
              />
            }
          />
        </DialogContent>
        <DialogActions>
          <SplitLayout
            startItem={
              collapsed && view === "child" ? (
                <Button
                  sentiment="accented"
                  appearance="transparent"
                  onClick={() => setView("parent")}
                >
                  Back
                </Button>
              ) : undefined
            }
            endItem={
              <StackLayout direction="row" gap={1}>
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  sentiment="accented"
                  appearance="solid"
                  onClick={() => setOpen(false)}
                >
                  Save
                </Button>
              </StackLayout>
            }
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
