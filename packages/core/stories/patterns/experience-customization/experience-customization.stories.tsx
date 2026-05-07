import {
  Banner,
  BannerContent,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Display3,
  Divider,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  H2,
  Input,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  NumberInput,
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  RadioButtonIcon,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  Switch,
  Text,
  useResponsiveProp,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import { US } from "@salt-ds/countries";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingIcon,
  GlobeIcon,
  LocationIcon,
  LockedIcon,
  SearchIcon,
  WarningSolidIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type ElementType,
  type FocusEvent,
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
import { DisplayModeContent } from "./DisplayModeContent";
import {
  NOTIFICATION_POSITIONS,
  NotificationPosition,
  NotificationsContent,
} from "./NotificationsContent";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import "../wizard/ContentOverflow.css";
import NegativeTrend from "./img/negative-trend.png";
import PositiveTrend from "./img/positive-trend.png";

export default {
  title: "Patterns/Experience Customization",
  parameters: {
    layout: "padded",
  },
} as Meta;

export interface ECFormData {
  acceptTerms: boolean;
  language: string;
  timezone: string;
  autoTranslate: boolean;
  position: string;
  displayDensity: string;
  currency: string;
  currencyFormat: string;
  stockNameDisplay: string;
  exchangeAndRegionDisplay: string;
  visibleMetrics: string;
  performanceChart: boolean;
}

export interface FormContentProps {
  formData: ECFormData;
  handleInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  stepFieldValidation: Record<string, FieldValidation>;
  handleSelectChange?: (value: string, name: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  handleRadioChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const wizardSteps = [
  {
    id: "foundation",
    label: "Foundation",
    stepTitle: "Foundation",
  },
  { id: "regional", label: "Regional settings", stepTitle: "Regional" },
  {
    id: "dataFormat",
    label: "Data format ",
    stepTitle: "Data format",
  },
  {
    id: "notifications",
    label: "Notification and settings",
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
  timezone: "",
  autoTranslate: false,
  // Data format
  currency: "usd",
  currencyFormat: "standard",

  stockNameDisplay: "tickerOnly",
  exchangeAndRegionDisplay: "text",
  visibleMetrics: "lastPrice",
  performanceChart: false,
  // Notifications
  position: "top-right",
};

const stepValidationSchemas: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: This is acceptable for an example.
  Yup.ObjectSchema<Record<string, any>>
> = {
  foundation: Yup.object({
    displayDensity: Yup.string().required("Display density is required."),
    acceptTerms: Yup.boolean().when("displayDensity", {
      is: "high",
      // biome-ignore lint/suspicious/noThenProperty: This is the correct Yup syntax for conditional validation.
      then: (schema) =>
        schema.oneOf(
          [true],
          "You must accept the terms to use high display density.",
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
  regional: Yup.object({
    language: Yup.string().required("Language is required."),
    timezone: Yup.string().required("Timezone is required."),
  }),
  displayMode: Yup.object({
    displayDensity: Yup.string().test({
      name: "high-density-warning",
      message: "warning",
      test(value, ctx) {
        if (!value) return true;
        if (value === "high") {
          return ctx.createError({
            params: { severity: "warning" },
          });
        }
        return true;
      },
    }),
  }),
};

const MultiStepTemplate = () => {
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
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
    next,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    foundation: <DisplayModeContent {...sharedFormProps} />,
    regional: <RegionalSettingsContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
  };

  const header = (
    <FlexLayout justify="space-between">
      <FlexItem style={{ flex: 1 }}>
        <Text>
          Create a new account
          <Text
            as="h2"
            ref={stepHeadingRef}
            tabIndex={-1}
            style={{ margin: 0 }}
          >
            {wizardSteps[activeStepIndex].label}
            <span className="salt-visuallyHidden">
              {`, step ${activeStepIndex + 1} of ${wizardSteps.length}`}
            </span>
          </Text>
        </Text>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper orientation="horizontal">
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
      {isLastStep ? "Finish" : "Next"}
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

  const startFooter =
    formData.displayDensity === "high" && activeStepIndex === 2 ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        // onClick={() => updateField("displayDensity", "medium")}
      >
        Reset to medium density
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
        <ContentOverflow style={{ height: 396 }}>
          {contentByStep[currentStepId]}
        </ContentOverflow>
      </FlexItem>
      <FlexItem>{footer}</FlexItem>
    </StackLayout>
  );
};

export const EndToEnd = {
  render: () => <MultiStepTemplate />,
};

export const MandatoryConfigurations = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();
  const [hasError, setHasError] = useState(false);

  const handleSubmit = () => {
    if (!selected) {
      setHasError(true);
    }
  };

  const governanceOptions = [
    {
      value: "standard",
      title: "Standard",
      description: "Business-recommended. Standard access logging.",
      Icon: BuildingIcon,
    },
    {
      value: "restricted",
      title: "Credit Card",
      description: "High compliance, Full data logging and MFA required.",
      Icon: LockedIcon,
    },
    {
      value: "external",
      title: "External",
      description: "Allow controlled access for partners.",
      Icon: GlobeIcon,
    },
  ];

  return (
    <StackLayout gap={0} style={{ maxWidth: 730 }}>
      <StackLayout padding={3}>
        <Text>
          Customize your experience
          <Text as="h2" style={{ margin: 0 }}>
            Set governance & privacy standards
          </Text>
          A selection is required to proceed
        </Text>
      </StackLayout>

      <FlexItem grow={1}>
        <ContentOverflow style={{ minHeight: 300 }}>
          <StackLayout>
            {hasError && (
              <Banner status="error">
                <BannerContent>
                  A selection is required to proceed
                </BannerContent>
              </Banner>
            )}
            <StackLayout>
              <InteractableCardGroup
                onChange={(_event, value) => {
                  setHasError(false);
                  setSelected(value);
                }}
              >
                {governanceOptions.map(
                  ({ value, title, description, Icon }) => (
                    <InteractableCard
                      key={value}
                      value={value}
                      style={{ width: "180px" }}
                    >
                      <StackLayout gap={1}>
                        <StackLayout gap={1} direction="row" align="center">
                          <Icon aria-hidden size={1} />
                          <Text style={{ margin: 0 }}>{title}</Text>
                        </StackLayout>
                        <StackLayout direction="row" gap={1}>
                          <RadioButtonIcon
                            aria-hidden
                            checked={selected === value}
                          />
                          <Text>{description}</Text>
                        </StackLayout>
                      </StackLayout>
                    </InteractableCard>
                  ),
                )}
              </InteractableCardGroup>
            </StackLayout>
          </StackLayout>
        </ContentOverflow>
      </FlexItem>

      <FlexLayout gap={1} justify="end" padding={3}>
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={() => {
            setSelected(undefined);
            setHasError(false);
          }}
        >
          Cancel
        </Button>
        <Button
          sentiment="accented"
          style={{
            cursor: !selected ? "var(--salt-cursor-disabled)" : "pointer",
          }}
          onClick={handleSubmit}
        >
          Finish
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const Onboarding = () => {
  type WizardState = "form" | "cancel-warning";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);

  const {
    state: { activeStepIndex, formData, validationsByStep },
    currentStepId,
    updateField,
    next,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update focus when active step changes
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const openWizard = () => {
    reset();
    setWizardState("form");
    setOpen(true);
  };

  const closeWizardAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      reset();
      setWizardState("form");
    }, 300);
  };

  const showCancelWarning = () => setWizardState("cancel-warning");
  const backToForm = () => setWizardState("form");

  const onOpenChange = (value: boolean) => {
    if (!value && !isLastStep) {
      showCancelWarning();
      return;
    }
    setOpen(value);
  };

  const handleNext = async () => {
    const valid = await runValidationAndStore();
    if (!valid) return;
    if (isLastStep) {
      closeWizardAndReset();
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const sharedFormProps: FormContentProps = {
    formData: formData as FormContentProps["formData"],
    handleInputChange: (e) => updateField(e.target.name, e.target.value),
    handleCheckboxChange: (e) => updateField(e.target.name, e.target.checked),
    handleSelectChange: (value: string, name: string) =>
      updateField(name, value),
    handleRadioChange: (e) => updateField(e.target.name, e.target.value),
    stepFieldValidation: validationsByStep[currentStepId]?.fields || {},
  };

  const contentByStep: Record<string, ReactElement> = {
    foundation: <DisplayModeContent {...sharedFormProps} />,
    regional: <RegionalSettingsContent {...sharedFormProps} />,
    notifications: <NotificationsContent {...sharedFormProps} />,
    dataFormat: <DataFormatContent {...sharedFormProps} />,
  };

  const cancel = (
    <Button
      sentiment="accented"
      appearance="transparent"
      onClick={showCancelWarning}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNext}>
      {isLastStep ? "Finish" : "Next"}
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

  const startFooter =
    formData.displayDensity === "high" && activeStepIndex === 2 ? (
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => updateField("displayDensity", "medium")}
      >
        Reset to medium density
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
      <Button onClick={openWizard}>Open experience customization</Button>
      <Dialog open={open} onOpenChange={onOpenChange} style={{ height: 588 }}>
        {wizardState === "cancel-warning" ? (
          <>
            <DialogContent>
              <GridLayout rows={1} columns={1} style={{ height: "100%" }}>
                <GridItem
                  horizontalAlignment="center"
                  verticalAlignment="center"
                >
                  <StackLayout align="center">
                    <WarningSolidIcon
                      size={2}
                      style={{
                        color:
                          "var(--salt-status-warning-foreground-decorative)",
                      }}
                    />
                    <Text styleAs="h2">Are you sure you want to cancel?</Text>
                    <Text>
                      Any changes you've made will be lost after you confirm
                      cancelling.
                    </Text>
                  </StackLayout>
                </GridItem>
              </GridLayout>
            </DialogContent>
            <DialogActions>
              <FlexLayout gap={1}>
                <Button
                  appearance="bordered"
                  sentiment="accented"
                  onClick={backToForm}
                >
                  No
                </Button>
                <Button sentiment="accented" onClick={closeWizardAndReset}>
                  Yes
                </Button>
              </FlexLayout>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogHeader
              header={
                <span tabIndex={-1} ref={stepHeadingRef}>
                  {wizardSteps[activeStepIndex].label}
                  <span className="salt-visuallyHidden">
                    {`, step ${activeStepIndex + 1} of ${wizardSteps.length}`}
                  </span>
                </span>
              }
              preheader="Customize your experience"
              actions={
                <Stepper orientation="horizontal">
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
            />
            <DialogContent>{contentByStep[currentStepId]}</DialogContent>
            <DialogActions>{footer}</DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export const StandardControls = () => {
  return (
    <StackLayout style={{ width: 314 }}>
      <FormField>
        <FormFieldLabel>Choose a language</FormFieldLabel>
        <Dropdown
          startAdornment={<SearchIcon />}
          bordered
          placeholder="Select language"
        >
          <Option value="English">English</Option>
          <Option value="Spanish">Spanish</Option>
          <Option value="French">French</Option>
          <Option value="German">German</Option>
        </Dropdown>
      </FormField>
      <FormField>
        <FormFieldLabel>Choose a time zone</FormFieldLabel>
        <Dropdown
          startAdornment={<LocationIcon />}
          bordered
          placeholder="Select time zone"
        >
          <Option value="Pacific/Midway">(UTC-11:00) Pacific/Midway</Option>
          <Option value="Pacific/Honolulu">(UTC-10:00) Hawaii</Option>
          <Option value="America/Anchorage">(UTC-09:00) Alaska</Option>
          <Option value="America/Los_Angeles">
            (UTC-08:00) Pacific Time (US & Canada)
          </Option>
          <Option value="America/Denver">
            (UTC-07:00) Mountain Time (US & Canada)
          </Option>
          <Option value="America/Chicago">
            (UTC-06:00) Central Time (US & Canada)
          </Option>
          <Option value="America/New_York">
            (UTC-05:00) Eastern Time (US & Canada)
          </Option>
          <Option value="America/Halifax">
            (UTC-04:00) Atlantic Time (Canada)
          </Option>
          <Option value="America/Argentina/Buenos_Aires">
            (UTC-03:00) Buenos Aires
          </Option>
          <Option value="Atlantic/South_Georgia">
            (UTC-02:00) Mid-Atlantic
          </Option>
          <Option value="Atlantic/Azores">(UTC-01:00) Azores</Option>
          <Option value="Europe/London">(UTC+00:00) London</Option>
          <Option value="Europe/Berlin">(UTC+01:00) Berlin</Option>
          <Option value="Europe/Paris">(UTC+01:00) Paris</Option>
          <Option value="Europe/Athens">(UTC+02:00) Athens</Option>
        </Dropdown>
      </FormField>
      <FormField>
        <FormFieldLabel>Automatically translate to English</FormFieldLabel>
        <Switch label="Off" />
      </FormField>
    </StackLayout>
  );
};

export const CardSelection = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Choose a placement for notification</FormFieldLabel>
        <InteractableCardGroup
          onChange={(_event, value) => {
            setSelected(value);
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
                        checked={selected === value}
                      />
                      <Text>{label}</Text>
                    </StackLayout>
                  </StackLayout>
                </InteractableCard>
              </FlexItem>
            ))}
          </FlexLayout>
        </InteractableCardGroup>
      </FormField>
      <FormField>
        <FormFieldLabel>Automatically dismiss notifications</FormFieldLabel>
        <Switch label="Off" />
      </FormField>
      <FormField>
        <FormFieldLabel>Extend notification display time</FormFieldLabel>
        <Switch label="Off" />
      </FormField>
    </StackLayout>
  );
};

export const DynamicPreview = () => {
  return (
    <FlexLayout style={{ maxWidth: 752 }} justify="space-between" wrap>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Stock name display</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton label="Ticker only" value="tickerOnly" />
            <RadioButton label="Ticker and full name" value="fullNameTicker" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Exchange & Region</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton label="Text only" value="text" />
            <RadioButton label="Flag only" value="flag" />
            <RadioButton label="Both" value="both" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Visible metrics</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton label="Last price" value="lastPrice" />
            <RadioButton label="Absolute change" value="absolute" />
            <RadioButton label="Percentage change" value="percentage" />
            <RadioButton label="Market Cap" value="marketCap" />
          </RadioButtonGroup>
        </FormField>

        <FormField>
          <FormFieldLabel>Performance chart</FormFieldLabel>
          <Switch label="Show" />
        </FormField>
      </StackLayout>
      <Card style={{ width: 372 }}>
        <StackLayout gap={1}>
          <FlexItem>
            <FlexLayout justify="space-between">
              <FlexItem>
                <Text>
                  <strong>VRT</strong>
                </Text>
                <Text color="secondary">VERTIV HOLDINGS CO-A</Text>
                <Display3>
                  328.02
                  <ArrowUpIcon
                    aria-hidden
                    style={{
                      color:
                        "var(--salt-sentiment-positive-foreground-informative)",
                    }}
                  />
                </Display3>
                <Text color="success">+6.27 (+1.95%)</Text>
              </FlexItem>
              <FlexItem>
                <FlexLayout gap={1} align="center">
                  <Text color="secondary">NYSE</Text>
                  <US />
                </FlexLayout>
              </FlexItem>
            </FlexLayout>
            <img
              src={PositiveTrend}
              alt="Positive trend"
              style={{ width: "100%" }}
            />
          </FlexItem>
          <Divider />
          <FlexItem>
            <FlexLayout justify="space-between">
              <FlexItem>
                <Text>
                  <strong>GEV</strong>
                </Text>
                <Text color="secondary">GE VERNOVA INC</Text>
                <Display3>
                  1147.27
                  <ArrowDownIcon
                    aria-hidden
                    style={{
                      color:
                        "var(--salt-sentiment-negative-foreground-informative)",
                    }}
                  />
                </Display3>
                <Text color="error">-4.03 (-0.35%)</Text>
              </FlexItem>

              <FlexItem>
                <FlexLayout gap={1} align="center">
                  <Text color="secondary">NYSE</Text>
                  <US />
                </FlexLayout>
              </FlexItem>
            </FlexLayout>

            <img
              src={NegativeTrend}
              alt="Negative trend"
              style={{ width: "100%" }}
            />
          </FlexItem>
        </StackLayout>
      </Card>
    </FlexLayout>
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
      aria-label="Basic indicator sidebar"
      appearance="indicator"
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

function PreferencesContent({ currentSection }: { currentSection: string }) {
  let content;

  if (currentSection === "Account") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <Input defaultValue="User name" readOnly />
        </FormField>
        <FormField>
          <FormFieldLabel>Company</FormFieldLabel>
          <Input defaultValue="Company" readOnly />
        </FormField>
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <Input defaultValue="user@example.com" readOnly />
          <FormFieldHelperText>
            This is managed by your company.
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Security type</FormFieldLabel>
          <Dropdown value="Password" />
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "General") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Auto-launch on startup</FormFieldLabel>
          <Switch checked />
          <FormFieldHelperText>
            Launch automatically at user login or system startup.
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Launcher orientation</FormFieldLabel>
          <RadioButtonGroup value="horizontal" direction="horizontal">
            <RadioButton label="Horizontal" value="horizontal" />
            <RadioButton label="Vertical" value="vertical" />
          </RadioButtonGroup>
          <FormFieldHelperText>
            Set the default orientation of the launcher when the user starts.
          </FormFieldHelperText>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Grid") {
    content = (
      <StackLayout gap={1}>
        <FormField labelPlacement="left">
          <FormFieldLabel>Grid row size</FormFieldLabel>
          <RadioButtonGroup value="medium" direction="horizontal">
            <RadioButton label="Small" value="small" />
            <RadioButton label="Medium" value="medium" />
            <RadioButton label="Large" value="large" />
          </RadioButtonGroup>
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Column filters</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Zebra stripes</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Status bar</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Column styling</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Cell styling</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Row styling</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Cell flashing</FormFieldLabel>
          <RadioButtonGroup value="off" direction="horizontal">
            <RadioButton label="Off" value="off" />
            <RadioButton label="All" value="all" />
            <RadioButton label="Specific cells" value="specific" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Export") {
    content = (
      <StackLayout>
        <Text>
          Default global settings for all new dashboards and widgets created.
        </Text>
        <StackLayout gap={1}>
          <FormField labelPlacement="left">
            <FormFieldLabel>File format</FormFieldLabel>
            <Dropdown value="PNG" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Publication style</FormFieldLabel>
            <Dropdown value="None" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Widget export width</FormFieldLabel>
            <NumberInput
              value="360"
              endAdornment={
                <Text>
                  <strong>PX</strong>
                </Text>
              }
            />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Dashboard size</FormFieldLabel>
            <Dropdown value="To scale" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Include title</FormFieldLabel>
            <Dropdown value="Yes" />
          </FormField>
        </StackLayout>
      </StackLayout>
    );
  }

  return (
    <StackLayout>
      <H2 styleAs="h3" style={{ margin: 0 }}>
        {currentSection}
      </H2>
      <div>{content}</div>
    </StackLayout>
  );
}

export const PreferenceDialog = () => {
  const sections = ["Account", "General", "Grid", "Export"];
  const [currentSection, setCurrentSection] = useState(sections[0]);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<"parent" | "child">("parent");

  const handleSectionChange = (section: string) => {
    setView("child");
    setCurrentSection(section);
  };

  return (
    <Dialog style={{ minHeight: "60%" }} open>
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
          child={<PreferencesContent currentSection={currentSection} />}
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
              <Button sentiment="accented" appearance="bordered">
                Cancel
              </Button>
              <Button sentiment="accented" appearance="solid">
                Save
              </Button>
            </StackLayout>
          }
        />
      </DialogActions>
    </Dialog>
  );
};
