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
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";
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
    activeStep < allSteps.length - 1 && setActiveStep(activeStep + 1);
  const previousStep = () => activeStep > 0 && setActiveStep(activeStep - 1);
  const resetSteps = () => setActiveStep(0);

  const actions = (
    <FlexLayout gap={1} justify="end">
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={resetSteps}
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
      <Button sentiment="accented" onClick={nextStep}>
        Next
      </Button>
    </FlexLayout>
  );

  return (
    <StackLayout className="container" gap={0}>
      <div className="header">{header}</div>
      <div className="content">{content}</div>
      <div className="actions">{actions}</div>
    </StackLayout>
  );
};

export const Modal = () => {
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
  };

  const content = allSteps[activeStep].content;

  const nextStep = () =>
    activeStep < allSteps.length - 1 && setActiveStep(activeStep + 1);
  const previousStep = () => activeStep > 0 && setActiveStep(activeStep - 1);
  // const resetSteps = () => setActiveStep(0);

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
      onClick={handleCancel}
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
    <Button sentiment="accented" onClick={nextStep}>
      Next
    </Button>
  );

  const stepperComponent = (
    <Stepper orientation="horizontal" style={{ width: 300 }}>
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
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open wizard
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader
          header={allSteps[activeStep].label}
          preheader="Create a new account"
          actions={stepperComponent}
        />
        <DialogContent style={{ height: 400 }}>{content}</DialogContent>
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
      </Dialog>
    </>
  );
};
