import "./wizard.stories.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Input,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  type StackLayoutProps,
  Step,
  Stepper,
  type StepperOrientation,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";
import { SuccessCircleSolidIcon, WarningSolidIcon } from "packages/icons/src";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "packages/lab/src";
import { type ElementType, useState } from "react";
export default {
  title: "Patterns/Wizard",
} as Meta;

const StepperComponent = ({
  steps,
  orientation,
  activeStep,
  style,
}: {
  orientation: StepperOrientation;
  steps: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  activeStep: number;
  style?: React.CSSProperties;
}) => (
  <Stepper orientation={orientation} style={style}>
    {steps.map((step, index) => (
      <Step
        key={step.id}
        label={step.label}
        stage={
          index === activeStep
            ? "active"
            : index < activeStep
              ? "completed"
              : "pending"
        }
      />
    ))}
  </Stepper>
);

const CancelWarningDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const handleClose = () => {
    onOpenChange(false);
  };

  const no = (
    <Button appearance="bordered" sentiment="accented" onClick={handleClose}>
      No
    </Button>
  );

  const yes = (
    <Button sentiment="accented" onClick={handleClose}>
      Yes
    </Button>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      status="warning"
      size="small"
    >
      <DialogHeader header="Are you sure you want to cancel" />
      <DialogContent>
        Any updates you've made so far will be lost after you confirm
        cancellation.
      </DialogContent>
      <DialogActions>
        {direction === "column" ? (
          <StackLayout gap={1} style={{ width: "100%" }}>
            {yes}
            {no}
          </StackLayout>
        ) : (
          <FlexLayout gap={1}>
            {no}
            {yes}
          </FlexLayout>
        )}
      </DialogActions>
    </Dialog>
  );
};

const AccountCreatedSuccessDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange} size="small" status="success">
    <DialogHeader header="Account created" />
    <DialogContent>You can now start using this new account.</DialogContent>
    <DialogActions>
      <Button sentiment="accented" onClick={() => onOpenChange(false)}>
        Done
      </Button>
    </DialogActions>
  </Dialog>
);

const AccountCreatedContent = () => (
  <StackLayout align="center">
    <SuccessCircleSolidIcon
      size={2}
      style={{
        color: "var(--salt-color-green-500)",
      }}
    />
    <Text styleAs="h2">Account created</Text>
    <Text>You can now start using this new account.</Text>
  </StackLayout>
);

const CancelWarningContent = () => (
  <StackLayout align="center">
    <WarningSolidIcon
      size={2}
      style={{
        color: "var(--salt-color-orange-500)",
      }}
    />
    <Text styleAs="h2">Are you sure you want to cancel?</Text>
    <Text>
      Any updates you've made so far will be lost after you confirm cancelling.
    </Text>
  </StackLayout>
);

const AdditionalInfoContent = ({ style }: { style?: React.CSSProperties }) => (
  <FlowLayout style={style}>
    <FormField necessity="optional">
      <FormFieldLabel>Initial Deposit Amount</FormFieldLabel>
      <Input placeholder="0.00" startAdornment={<Text>$</Text>} />
    </FormField>
    <FormField necessity="optional">
      <FormFieldLabel>Beneficiary Name</FormFieldLabel>
      <Input />
    </FormField>
    <FormField necessity="optional">
      <FormFieldLabel>Source of Funds</FormFieldLabel>
      <Input />
    </FormField>
    <FormField necessity="optional">
      <FormFieldLabel>Paperless Statements</FormFieldLabel>
      <Dropdown defaultSelected={["Please select"]}>
        <Option value="Please select" />
        <Option value="Yes" />
        <Option value="No" />
      </Dropdown>
    </FormField>
  </FlowLayout>
);

const AccountTypeContent = () => (
  <FormField>
    <FormFieldLabel>Select Account Type</FormFieldLabel>
    <RadioButtonGroup
      direction="vertical"
      name="account-type"
      defaultValue="checking-account"
    >
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Checking Account</Text>
            <Text color="secondary" styleAs="label">
              Everyday banking needs
            </Text>
          </StackLayout>
        }
        value="checking-account"
      />
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Savings Account</Text>
            <Text color="secondary" styleAs="label">
              Save and earn interest
            </Text>
          </StackLayout>
        }
        value="savings-account"
      />
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Money Market Account</Text>
            <Text color="secondary" styleAs="label">
              Higher interest, flexible access
            </Text>
          </StackLayout>
        }
        value="money-market-account"
      />
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Certificate of Deposit (CD)</Text>
            <Text color="secondary" styleAs="label">
              Fixed term, higher rates
            </Text>
          </StackLayout>
        }
        value="cd"
      />
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Business Account</Text>
            <Text color="secondary" styleAs="label">
              For business transactions
            </Text>
          </StackLayout>
        }
        value="business-account"
      />
      <RadioButton
        label={
          <StackLayout align="start" gap={0.5}>
            <Text>Trust Account</Text>
            <Text color="secondary" styleAs="label">
              Estate and trust management
            </Text>
          </StackLayout>
        }
        value="trust-account"
      />
    </RadioButtonGroup>
  </FormField>
);

const CreateAccountContent = () => (
  <GridLayout columns={2} gap={3}>
    <GridItem>
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Full name</FormFieldLabel>
          <Input defaultValue="Jane Doe" />
        </FormField>
        <FormField>
          <FormFieldLabel>Date of Birth</FormFieldLabel>
          <DatePicker selectionVariant="single">
            <DatePickerTrigger>
              <DatePickerSingleInput />
            </DatePickerTrigger>
            <DatePickerOverlay>
              <DatePickerSingleGridPanel helperText="Date format DD MMM YYYY (e.g. 09 Jun 2024)" />
            </DatePickerOverlay>
          </DatePicker>
        </FormField>
        <FormField>
          <FormFieldLabel>Phone Number</FormFieldLabel>
          <Input defaultValue="+1 (212) 555-0100" />
        </FormField>
        <FormField>
          <FormFieldLabel>Email Address</FormFieldLabel>
          <Input defaultValue="jane.doe@email.com" />
        </FormField>
      </StackLayout>
    </GridItem>

    <GridItem>
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input defaultValue="Value text" />
        </FormField>
        <FormField necessity="optional">
          <FormFieldLabel>Address 2</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>
            Flat, Apt, Suite, Floor, Building etc.
          </FormFieldHelperText>
        </FormField>

        <FlexLayout>
          <FormField>
            <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
            <Input defaultValue="E14 5JP" />
          </FormField>
          <FormField>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <Input defaultValue="London" />
            <FormFieldHelperText>Locality, Settlement etc.</FormFieldHelperText>
          </FormField>
        </FlexLayout>

        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <Dropdown defaultSelected={["United Kingdom"]}>
            <Option value="United Kingdom">United Kingdom</Option>
          </Dropdown>
        </FormField>
      </StackLayout>
    </GridItem>
  </GridLayout>
);

const ReviewAccountContent = () => (
  <GridLayout columns={2}>
    <GridItem>
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Full name</FormFieldLabel>
          <Input defaultValue="Jane Doe" />
        </FormField>
        <FormField>
          <FormFieldLabel>Date of Birth</FormFieldLabel>
          <DatePicker selectionVariant="single">
            <DatePickerTrigger>
              <DatePickerSingleInput />
            </DatePickerTrigger>
            <DatePickerOverlay>
              <DatePickerSingleGridPanel helperText="Date format DD MMM YYYY (e.g. 09 Jun 2024)" />
            </DatePickerOverlay>
          </DatePicker>
        </FormField>
        <FormField>
          <FormFieldLabel>Phone Number</FormFieldLabel>
          <Input defaultValue="Jane Doe" />
        </FormField>
        <FormField>
          <FormFieldLabel>Date of Birth</FormFieldLabel>
          <Input defaultValue="+1 (212) 555-0100" />
        </FormField>
        <FormField>
          <FormFieldLabel>Email Address</FormFieldLabel>
          <Input defaultValue="jane.doe@email.com" />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input defaultValue="Value text" />
        </FormField>
        <FormField necessity="optional">
          <FormFieldLabel>Address 2</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>
            Flat, Apt, Suite, Floor, Building etc.
          </FormFieldHelperText>
        </FormField>

        <FlexLayout>
          <FormField>
            <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
            <Input defaultValue="E14 5JP" />
          </FormField>
          <FormField>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <Input defaultValue="London" />
            <FormFieldHelperText>Locality, Settlement etc.</FormFieldHelperText>
          </FormField>
        </FlexLayout>

        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <Dropdown defaultSelected={["United Kingdom"]}>
            <Option value="United Kingdom">United Kingdom</Option>
          </Dropdown>
        </FormField>
      </StackLayout>
    </GridItem>

    <GridItem>
      <StackLayout gap={3}>
        <AccountTypeContent />
        <AdditionalInfoContent />
      </StackLayout>
    </GridItem>
  </GridLayout>
);

export const Horizontal = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const allSteps = [
    {
      id: "account-details",
      label: "Account details",
      content: <CreateAccountContent />,
    },
    {
      id: "account-type",
      label: "Account type",
      content: <AccountTypeContent />,
    },
    {
      id: "additional-info",
      label: "Additional info",
      content: <AdditionalInfoContent style={{ width: "50%" }} />,
    },
    {
      id: "review",
      label: "Review and create",
      content: <ReviewAccountContent />,
    },
  ];

  const header = (
    <FlexLayout justify="space-between" align="start" style={{ width: "100%" }}>
      <div>
        <Text>Create a new account</Text>
        <Text color="secondary" styleAs="h2">
          {allSteps[activeStep].label}
        </Text>
      </div>
      <Stepper orientation="horizontal" style={{ width: 340 }}>
        {allSteps.map((step, index) => (
          <Step
            key={step.id}
            label={step.label}
            stage={
              index === activeStep
                ? "active"
                : index < activeStep
                  ? "completed"
                  : "pending"
            }
          />
        ))}
      </Stepper>
    </FlexLayout>
  );

  const content = allSteps[activeStep].content;

  const nextStep = () =>
    activeStep < allSteps.length - 1 &&
    setActiveStep((prevStep) => prevStep + 1);
  const previousStep = () =>
    activeStep > 0 && setActiveStep((prevStep) => prevStep - 1);
  // const resetSteps = () => setActiveStep(0);

  const handleCancel = () => {
    setCancelOpen(true);
  };

  const handleSuccess = () => {
    setSuccessOpen(true);
  };

  const isLastStep = activeStep === allSteps.length - 1;

  const actions = (
    <FlexLayout gap={1} justify="end">
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={handleCancel}
      >
        Cancel
      </Button>
      {activeStep > 0 && (
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={previousStep}
        >
          Previous
        </Button>
      )}
      <Button
        sentiment="accented"
        onClick={isLastStep ? handleSuccess : nextStep}
      >
        {isLastStep ? "Create" : "Next"}
      </Button>
    </FlexLayout>
  );

  return (
    <>
      <StackLayout className="container" gap={0}>
        <div className="header">{header}</div>
        <div className="content">{content}</div>
        <div className="actions">{actions}</div>
      </StackLayout>
      <CancelWarningDialog open={cancelOpen} onOpenChange={setCancelOpen} />
      <AccountCreatedSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
      />
    </>
  );
};

export const Vertical = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const allSteps = [
    {
      id: "account-details",
      label: "Account details",
      content: <CreateAccountContent />,
    },
    {
      id: "account-type",
      label: "Account type",
      content: <AccountTypeContent />,
    },
    {
      id: "additional-info",
      label: "Additional info",
      content: <AdditionalInfoContent style={{ width: "50%" }} />,
    },
    {
      id: "review",
      label: "Review and create",
      content: <ReviewAccountContent />,
    },
  ];

  const isLastStep = activeStep === allSteps.length - 1;

  const nextStep = () =>
    activeStep < allSteps.length - 1 &&
    setActiveStep((prevStep) => prevStep + 1);
  const previousStep = () =>
    activeStep > 0 && setActiveStep((prevStep) => prevStep - 1);
  // const resetSteps = () => setActiveStep(0);

  const handleCancel = () => {
    setCancelOpen(true);
  };

  const handleSuccess = () => {
    setSuccessOpen(true);
  };

  const actions = (
    <FlexLayout gap={1} justify="end">
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={handleCancel}
      >
        Cancel
      </Button>
      {activeStep > 0 && (
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={previousStep}
        >
          Previous
        </Button>
      )}
      <Button
        sentiment="accented"
        onClick={isLastStep ? handleSuccess : nextStep}
      >
        {isLastStep ? "Create" : "Next"}
      </Button>
    </FlexLayout>
  );

  const content = allSteps[activeStep].content;
  const header = (
    <StackLayout gap={0}>
      <Text>Create a new account</Text>
      <Text color="secondary" styleAs="h2">
        {allSteps[activeStep].label}
      </Text>
    </StackLayout>
  );

  return (
    <>
      <StackLayout className="verticalContainer">
        <div className="header">{header}</div>
        <GridLayout columns={3} gap={0} className="contentVerticalContainer">
          <GridItem>
            <StepperComponent
              orientation="vertical"
              steps={allSteps}
              activeStep={activeStep}
            />
          </GridItem>
          <GridItem colSpan={2} className="contentVertical">
            {content}
          </GridItem>
        </GridLayout>
        <div className="actions">{actions}</div>
      </StackLayout>
      <CancelWarningDialog open={cancelOpen} onOpenChange={setCancelOpen} />
      <AccountCreatedSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
      />
    </>
  );
};

export const Modal = () => {
  type WizardState = "form" | "cancel-warning" | "success";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const allSteps = [
    {
      id: "account-details",
      label: "Account details",
      content: <CreateAccountContent />,
    },
    {
      id: "account-type",
      label: "Account type",
      content: <AccountTypeContent />,
    },
    {
      id: "additional-info",
      label: "Additional info",
      content: <AdditionalInfoContent style={{ width: "50%" }} />,
    },
    {
      id: "review",
      label: "Review and create",
      content: <ReviewAccountContent />,
    },
  ];

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleCancel = () => {
    setOpen(false);
    setActiveStep(0);
    setTimeout(() => {
      setWizardState("form");
    }, 300);
  };

  const content = allSteps[activeStep].content;

  const createAccount = () => {
    setWizardState("success");
  };
  const cancelWarning = () => {
    setWizardState("cancel-warning");
  };
  const backToForm = () => {
    setWizardState("form");
  };
  const nextStep = () =>
    activeStep < allSteps.length - 1 && setActiveStep(activeStep + 1);
  const previousStep = () => activeStep > 0 && setActiveStep(activeStep - 1);
  // const resetSteps = () => setActiveStep(0);

  const isLastFormStep = activeStep === allSteps.length - 1;

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const cancel = (
    <Button
      sentiment="accented"
      appearance="transparent"
      onClick={cancelWarning}
    >
      Cancel
    </Button>
  );
  const previous = activeStep > 0 && (
    <Button sentiment="accented" appearance="bordered" onClick={previousStep}>
      Previous
    </Button>
  );
  const next = (
    <Button
      sentiment="accented"
      onClick={isLastFormStep ? createAccount : nextStep}
    >
      {isLastFormStep ? "Create" : "Next"}
    </Button>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open wizard
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status={
          wizardState === "cancel-warning"
            ? "warning"
            : wizardState === "success"
              ? "success"
              : undefined
        }
        style={{ height: 588 }}
      >
        {(() => {
          switch (wizardState) {
            case "cancel-warning":
              return (
                <>
                  <DialogContent
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <CancelWarningContent />
                  </DialogContent>
                  <DialogActions>
                    {direction === "column" ? (
                      <StackLayout gap={1} style={{ width: "100%" }}>
                        <Button sentiment="accented" onClick={handleCancel}>
                          Yes
                        </Button>
                        <Button
                          appearance="bordered"
                          sentiment="accented"
                          onClick={backToForm}
                        >
                          No
                        </Button>
                      </StackLayout>
                    ) : (
                      <FlexLayout gap={1}>
                        <Button
                          appearance="bordered"
                          sentiment="accented"
                          onClick={backToForm}
                        >
                          No
                        </Button>
                        <Button sentiment="accented" onClick={handleCancel}>
                          Yes
                        </Button>
                      </FlexLayout>
                    )}
                  </DialogActions>
                </>
              );
            case "success":
              return (
                <>
                  <DialogContent
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <AccountCreatedContent />
                  </DialogContent>
                  <DialogActions>
                    <Button sentiment="accented" onClick={handleCancel}>
                      Done
                    </Button>
                  </DialogActions>
                </>
              );
            default:
              return (
                <>
                  <DialogHeader
                    header={allSteps[activeStep].label}
                    preheader="Create a new account"
                    actions={
                      <StepperComponent
                        orientation="horizontal"
                        steps={allSteps}
                        activeStep={activeStep}
                        style={{ width: 300 }}
                      />
                    }
                  />
                  <DialogContent>{content}</DialogContent>
                  <DialogActions>
                    {direction === "column" ? (
                      <StackLayout gap={1} style={{ width: "100%" }}>
                        {next}
                        {previous}
                        {cancel}
                      </StackLayout>
                    ) : (
                      <FlexLayout gap={1}>
                        {cancel}
                        {previous}
                        {next}
                      </FlexLayout>
                    )}
                  </DialogActions>
                </>
              );
          }
        })()}
      </Dialog>
    </>
  );
};
