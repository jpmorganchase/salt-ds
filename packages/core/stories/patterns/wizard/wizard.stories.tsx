import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FlexItem,
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
import { SuccessCircleSolidIcon, WarningSolidIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { type ChangeEventHandler, type ElementType, useState } from "react";
import {
  type AccountFormData,
  type ContentType,
  ContentTypeEnum,
  type FieldValidation,
  stepFieldRules,
  useWizard,
  type ValidationStatus,
  validateStep,
} from "./useWizard";
export default {
  title: "Patterns/Wizard",
} as Meta;

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

interface FormProps {
  stepId: ContentType;
  formData: AccountFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccountFormData>>;
  handleCancel: () => void;
  handleNext?: () => void;
  handlePrevious?: () => void;
  fieldValidation: Record<string, FieldValidation>;
  persistValidation: (data: AccountFormData, stepId: ContentType) => void;
}

interface FormContentProps {
  formData: AccountFormData;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  fieldValidation: {
    [field: string]: { status?: ValidationStatus; message?: string };
  };
  handleSelectChange?: (value: string, name: string) => void;
}

const WIZARD_STEPS = [
  { id: ContentTypeEnum.AccountDetails, label: "Account details" },
  { id: ContentTypeEnum.AccountType, label: "Account type" },
  { id: ContentTypeEnum.AdditionalInfo, label: "Additional info" },
  { id: ContentTypeEnum.Review, label: "Review and create" },
] as const;

const ACCOUNT_TYPE_OPTIONS: {
  value: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "checking",
    title: "Checking Account",
    subtitle: "Everyday banking needs",
  },
  {
    value: "savings",
    title: "Savings Account",
    subtitle: "Save and earn interest",
  },
  {
    value: "moneyMarket",
    title: "Money Market Account",
    subtitle: "Higher interest, flexible access",
  },
  {
    value: "cd",
    title: "Certificate of Deposit (CD)",
    subtitle: "Fixed term, higher rates",
  },
  {
    value: "business",
    title: "Business Account",
    subtitle: "For business transactions",
  },
  {
    value: "trust",
    title: "Trust Account",
    subtitle: "Estate and trust management",
  },
];

const getStepStatus = (index: number, activeStep: number) => {
  if (index === activeStep) return "active";
  if (index < activeStep) return "completed";
  return "pending";
};

const CancelWarningDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) => {
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
    <Button sentiment="accented" onClick={onConfirm}>
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
  onConfirm,
}: ConfirmationDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={onOpenChange}
    size="small"
    status="success"
    initialFocus={0}
  >
    <DialogHeader header="Account created" />
    <DialogContent>You can now start using this new account.</DialogContent>
    <DialogActions>
      <Button sentiment="accented" onClick={onConfirm}>
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
        color: "var(--salt-status-success-foreground-decorative)",
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
        color: "var(--salt-status-warning-foreground-decorative)",
      }}
    />
    <Text styleAs="h2">Are you sure you want to cancel?</Text>
    <Text>
      Any updates you've made so far will be lost after you confirm cancelling.
    </Text>
  </StackLayout>
);

const AdditionalInfoContent = ({
  formData,
  handleInputChange,
  handleInputBlur,
  handleSelectChange,
  fieldValidation,
}: FormContentProps) => {
  return (
    <FlowLayout>
      <FormField
        necessity="optional"
        validationStatus={fieldValidation.initialDeposit?.status}
      >
        <FormFieldLabel>Initial Deposit Amount</FormFieldLabel>
        <Input
          placeholder="0.00"
          startAdornment={<Text>$</Text>}
          inputProps={{
            name: "initialDeposit",
            value: formData.initialDeposit,
            onChange: handleInputChange,
            onBlur: handleInputBlur,
          }}
        />
        {fieldValidation.initialDeposit?.status && (
          <FormFieldHelperText>
            {fieldValidation.initialDeposit.message}
          </FormFieldHelperText>
        )}
      </FormField>
      <FormField necessity="optional">
        <FormFieldLabel>Beneficiary Name</FormFieldLabel>
        <Input
          inputProps={{
            name: "beneficiaryName",
            value: formData.beneficiaryName,
            onChange: handleInputChange,
            onBlur: handleInputBlur,
          }}
        />
      </FormField>
      <FormField necessity="optional">
        <FormFieldLabel>Source of Funds</FormFieldLabel>
        <Input
          inputProps={{
            name: "sourceOfFunds",
            value: formData.sourceOfFunds,
            onChange: handleInputChange,
            onBlur: handleInputBlur,
          }}
        />
      </FormField>
      <FormField necessity="optional">
        <FormFieldLabel>Paperless Statements</FormFieldLabel>
        <Dropdown
          name="paperlessStatements"
          value={formData.paperlessStatements}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "paperlessStatements")
          }
        >
          <Option value="">Please select</Option>
          <Option value="Yes" />
          <Option value="No" />
        </Dropdown>
      </FormField>
    </FlowLayout>
  );
};
const AdditionalInfoForm = ({
  stepId,
  handleCancel,
  handlePrevious,
  handleNext,
  setFormData,
  formData,
  fieldValidation,
  persistValidation,
}: FormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepFieldRules[stepId][name]) {
      persistValidation(nextData, stepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepFieldRules[stepId][name]) {
      persistValidation(nextData, stepId);
    }
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepFieldRules[stepId][name]) {
      persistValidation(formData, stepId);
    }
  };
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };

  return (
    <StackLayout
      gap={3}
      as="form"
      onSubmit={handleFormSubmit}
      style={{ height: "100%" }}
    >
      <FlexItem grow={1} style={{ width: "50%" }}>
        <AdditionalInfoContent
          formData={formData}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
          handleSelectChange={handleSelectChange}
          fieldValidation={fieldValidation}
        />
      </FlexItem>
      <FlexLayout gap={1} justify="end">
        <Button
          sentiment="accented"
          appearance="transparent"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={handlePrevious}
        >
          Previous
        </Button>

        <Button sentiment="accented" type="submit">
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

const AccountTypeContent = ({
  handleInputBlur,
  formData,
  fieldValidation,
  handleInputChange,
}: FormContentProps) => {
  return (
    <FormField validationStatus={fieldValidation.accountType?.status}>
      <FormFieldLabel>Select Account Type</FormFieldLabel>
      <RadioButtonGroup
        direction="vertical"
        onChange={handleInputChange}
        value={formData.accountType}
      >
        {ACCOUNT_TYPE_OPTIONS.map(({ value, title, subtitle }) => (
          <RadioButton
            key={value}
            label={
              <StackLayout align="start" gap={0.5}>
                <Text>{title}</Text>
                <Text color="secondary" styleAs="label">
                  {subtitle}
                </Text>
              </StackLayout>
            }
            name="accountType"
            value={value}
            onBlur={handleInputBlur}
          />
        ))}
      </RadioButtonGroup>
      {fieldValidation.accountType?.status && (
        <FormFieldHelperText>
          {fieldValidation.accountType.message}
        </FormFieldHelperText>
      )}
    </FormField>
  );
};
const AccountTypeForm = ({
  stepId,
  handleCancel,
  handlePrevious,
  handleNext,
  setFormData,
  formData,
  fieldValidation,
  persistValidation,
}: FormProps) => {
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    const nextData = { ...formData, accountType: value };
    setFormData(nextData);
    persistValidation(nextData, stepId);
  };
  const handleInputBlur = () => {
    persistValidation(formData, stepId);
  };
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };
  return (
    <StackLayout
      gap={3}
      as="form"
      onSubmit={handleFormSubmit}
      style={{ height: "100%" }}
    >
      <FlexItem grow={1}>
        <AccountTypeContent
          formData={formData}
          handleInputBlur={handleInputBlur}
          fieldValidation={fieldValidation}
          handleInputChange={handleInputChange}
        />
      </FlexItem>
      <FlexLayout gap={1} justify="end">
        <Button
          sentiment="accented"
          appearance="transparent"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={handlePrevious}
        >
          Previous
        </Button>

        <Button sentiment="accented" type="submit">
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

const AccountDetailsContent = ({
  formData,
  fieldValidation,
  handleInputChange,
  handleInputBlur,
  handleSelectChange,
}: FormContentProps) => {
  return (
    <GridLayout columns={2} gap={3} style={{ width: "100%" }}>
      <GridItem>
        <StackLayout gap={3}>
          <FormField validationStatus={fieldValidation.fullName?.status}>
            <FormFieldLabel>Full name</FormFieldLabel>
            <Input
              inputProps={{
                name: "fullName",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.fullName,
              }}
            />
            {fieldValidation.fullName?.status && (
              <FormFieldHelperText>
                {fieldValidation.fullName.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField>
            <FormFieldLabel>Phone Number</FormFieldLabel>
            <Input
              inputProps={{
                name: "phoneNumber",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.phoneNumber,
              }}
            />
          </FormField>
          <FormField>
            <FormFieldLabel>Email Address</FormFieldLabel>
            <Input
              inputProps={{
                name: "emailAddress",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.emailAddress,
              }}
            />
          </FormField>
        </StackLayout>
      </GridItem>

      <GridItem>
        <StackLayout gap={3}>
          <FormField validationStatus={fieldValidation.address1?.status}>
            <FormFieldLabel>Address 1</FormFieldLabel>
            <Input
              inputProps={{
                name: "address1",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.address1,
              }}
            />
            {fieldValidation.address1?.status && (
              <FormFieldHelperText>
                {fieldValidation.address1.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Address 2</FormFieldLabel>
            <Input
              inputProps={{
                name: "address2",
                onChange: handleInputChange,
                value: formData.address2,
              }}
            />
            <FormFieldHelperText>
              Flat, Apt, Suite, Floor, Building etc.
            </FormFieldHelperText>
          </FormField>

          <FlexLayout>
            <FormField>
              <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
              <Input
                inputProps={{
                  name: "postalCode",
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  value: formData.postalCode,
                }}
              />
            </FormField>
            <FormField>
              <FormFieldLabel>Town/City</FormFieldLabel>
              <Input
                inputProps={{
                  name: "city",
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  value: formData.city,
                }}
              />
              <FormFieldHelperText>
                Locality, Settlement etc.
              </FormFieldHelperText>
            </FormField>
          </FlexLayout>

          <FormField>
            <FormFieldLabel>Country</FormFieldLabel>
            <Dropdown
              name="country"
              value={formData.country}
              onSelectionChange={(_e, value) =>
                handleSelectChange?.(value[0], "country")
              }
            >
              <Option value="United Kingdom">United Kingdom</Option>
              <Option value="United States">United States</Option>
            </Dropdown>
          </FormField>
        </StackLayout>
      </GridItem>
    </GridLayout>
  );
};
const AccountDetailsForm = ({
  stepId,
  handleCancel,
  handleNext,
  setFormData,
  formData,
  fieldValidation,
  persistValidation,
}: FormProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepFieldRules[stepId][name]) {
      persistValidation(formData, stepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepFieldRules[stepId][name]) {
      persistValidation(nextData, stepId);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };

  return (
    <StackLayout
      gap={3}
      style={{ height: "100%" }}
      as="form"
      onSubmit={handleFormSubmit}
    >
      <FlexItem grow={1}>
        <AccountDetailsContent
          formData={formData}
          handleInputBlur={handleInputBlur}
          fieldValidation={fieldValidation}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />
      </FlexItem>
      <FlexLayout gap={1} justify="end">
        <Button
          sentiment="accented"
          appearance="transparent"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button type="submit" sentiment="accented">
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

const ReviewAccountContent = ({ formData }: Pick<FormProps, "formData">) => (
  <GridLayout columns={2}>
    <GridItem>
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Full name</FormFieldLabel>
          <Input
            inputProps={{
              value: formData.fullName,
            }}
            readOnly
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Phone Number</FormFieldLabel>
          <Input
            inputProps={{
              value: formData.phoneNumber,
            }}
            readOnly
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Email Address</FormFieldLabel>
          <Input
            inputProps={{
              value: formData.emailAddress,
            }}
            readOnly
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input
            inputProps={{
              value: formData.address1,
            }}
            readOnly
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 2</FormFieldLabel>
          <Input
            inputProps={{
              value: formData.address2,
            }}
            readOnly
          />
          <FormFieldHelperText>
            Flat, Apt, Suite, Floor, Building etc.
          </FormFieldHelperText>
        </FormField>

        <FlexLayout>
          <FormField>
            <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.postalCode,
              }}
              readOnly
            />
          </FormField>
          <FormField>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.city,
              }}
              readOnly
            />
            <FormFieldHelperText>Locality, Settlement etc.</FormFieldHelperText>
          </FormField>
        </FlexLayout>

        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <Dropdown
            value={formData.country}
            defaultSelected={[formData.country]}
            readOnly
          >
            <Option value="United Kingdom">United Kingdom</Option>
            <Option value="United States">United States</Option>
          </Dropdown>
        </FormField>
      </StackLayout>
    </GridItem>

    <GridItem>
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Select Account Type</FormFieldLabel>
          <RadioButtonGroup
            direction="vertical"
            value={formData.accountType}
            readOnly
          >
            {ACCOUNT_TYPE_OPTIONS.map(({ value, title, subtitle }) => (
              <RadioButton
                key={value}
                label={
                  <StackLayout align="start" gap={0.5}>
                    <Text>{title}</Text>
                    <Text color="secondary" styleAs="label">
                      {subtitle}
                    </Text>
                  </StackLayout>
                }
                name="accountType"
                value={value}
              />
            ))}
          </RadioButtonGroup>
        </FormField>

        <FlowLayout>
          <FormField necessity="optional">
            <FormFieldLabel>Initial Deposit Amount</FormFieldLabel>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              startAdornment={<Text>$</Text>}
              inputProps={{
                name: "initialDeposit",
                value: formData.initialDeposit,
              }}
              readOnly
            />
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Beneficiary Name</FormFieldLabel>
            <Input
              inputProps={{
                name: "beneficiaryName",
                value: formData.beneficiaryName,
              }}
              readOnly
            />
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Source of Funds</FormFieldLabel>
            <Input
              inputProps={{
                name: "sourceOfFunds",
                value: formData.sourceOfFunds,
              }}
              readOnly
            />
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Paperless Statements</FormFieldLabel>
            <Dropdown
              name="paperlessStatements"
              value={formData.paperlessStatements}
              defaultSelected={[formData.paperlessStatements]}
              readOnly
            >
              <Option value="Please select" />
              <Option value="Yes" />
              <Option value="No" />
            </Dropdown>
          </FormField>
        </FlowLayout>
      </StackLayout>
    </GridItem>
  </GridLayout>
);
const ReviewAccountForm = ({
  handleCancel,
  handlePrevious,
  handleNext,
  formData,
}: FormProps) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleNext?.();
  };
  return (
    <StackLayout
      gap={3}
      style={{ height: "100%" }}
      as="form"
      onSubmit={handleSubmit}
    >
      <FlexItem grow={1} style={{ overflowY: "auto" }}>
        <ReviewAccountContent formData={formData} />
      </FlexItem>
      <FlexLayout gap={1} justify="end">
        <Button
          sentiment="accented"
          appearance="transparent"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={handlePrevious}
        >
          Previous
        </Button>

        <Button sentiment="accented" type="submit">
          Create
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const Horizontal = () => {
  const {
    activeStep,
    formData,
    setFormData,
    stepValidation,
    next,
    previous,
    reset,
    setValidationByStep,
    fieldValidation,
    validateCurrentStep,
  } = useWizard(WIZARD_STEPS);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const persistValidation = (data: AccountFormData, stepId: ContentType) => {
    const { fieldValidation: fv, stepStatus } = validateStep(stepId, data);
    setValidationByStep((prev) => ({
      ...prev,
      [stepId]: { fields: fv, status: stepStatus },
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    next();
  };

  const commonProps = {
    formData,
    setFormData,
    handleCancel: () => setCancelOpen(true),
    handleNext,
    handlePrevious: previous,
    fieldValidation,
    persistValidation,
  };

  const handleSuccess = () => setSuccessOpen(true);

  const renderActiveContent = () => {
    const id = WIZARD_STEPS[activeStep].id;
    switch (id) {
      case ContentTypeEnum.AccountDetails:
        return <AccountDetailsForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.AccountType:
        return <AccountTypeForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return <AdditionalInfoForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.Review:
        return (
          <ReviewAccountForm
            stepId={id}
            {...commonProps}
            handleNext={handleSuccess}
          />
        );
      default:
        return null;
    }
  };

  const header = (
    <FlexLayout justify="space-between" align="start" style={{ width: "100%" }}>
      <Text>
        Create a new account
        <Text color="primary" styleAs="h2">
          {WIZARD_STEPS[activeStep].label}
        </Text>
      </Text>

      <Stepper orientation="horizontal" style={{ width: 340 }}>
        {WIZARD_STEPS.map((step, index) => (
          <Step
            key={step.id}
            label={step.label}
            status={stepValidation[step.id]?.status}
            stage={getStepStatus(index, activeStep)}
          />
        ))}
      </Stepper>
    </FlexLayout>
  );

  return (
    <>
      <StackLayout
        gap={3}
        padding={3}
        style={{
          width: 730,
          height: 588,
        }}
      >
        <FlexItem>{header}</FlexItem>
        <FlexItem
          grow={1}
          style={{
            overflowY: "hidden",
          }}
        >
          {renderActiveContent()}
        </FlexItem>
      </StackLayout>
      <CancelWarningDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          reset();
          setCancelOpen(false);
        }}
      />
      <AccountCreatedSuccessDialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          if (!open) {
            reset();
            setSuccessOpen(false);
          }
        }}
        onConfirm={() => {
          reset();
          setSuccessOpen(false);
        }}
      />
    </>
  );
};

export const Vertical = () => {
  const {
    activeStep,
    formData,
    setFormData,
    stepValidation,
    next,
    previous,
    reset,
    setValidationByStep,
    validateCurrentStep,
    fieldValidation,
  } = useWizard(WIZARD_STEPS);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSuccess = () => setSuccessOpen(true);

  const persistValidation = (data: AccountFormData, stepId: ContentType) => {
    const { fieldValidation: fv, stepStatus } = validateStep(stepId, data);
    setValidationByStep((prev) => ({
      ...prev,
      [stepId]: { fields: fv, status: stepStatus },
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    next();
  };

  const commonProps = {
    formData,
    setFormData,
    handleCancel: () => setCancelOpen(true),
    handleNext,
    handlePrevious: previous,
    fieldValidation,
    persistValidation,
  };

  const renderActiveContent = () => {
    const id = WIZARD_STEPS[activeStep].id;
    switch (id) {
      case ContentTypeEnum.AccountDetails:
        return <AccountDetailsForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.AccountType:
        return <AccountTypeForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return <AdditionalInfoForm stepId={id} {...commonProps} />;
      case ContentTypeEnum.Review:
        return (
          <ReviewAccountForm
            stepId={id}
            {...commonProps}
            handleNext={handleSuccess}
          />
        );
      default:
        return null;
    }
  };

  const header = (
    <StackLayout gap={0}>
      <Text>Create a new account</Text>
      <Text color="primary" styleAs="h2">
        {WIZARD_STEPS[activeStep].label}
      </Text>
    </StackLayout>
  );

  return (
    <>
      <StackLayout
        gap={3}
        style={{
          width: 850,
        }}
        padding={3}
      >
        {header}
        <GridLayout columns={3} gap={3} style={{ height: 424 }}>
          <GridItem>
            <Stepper orientation="vertical">
              {WIZARD_STEPS.map((step, index) => (
                <Step
                  key={step.id}
                  label={step.label}
                  status={stepValidation[step.id]?.status}
                  stage={getStepStatus(index, activeStep)}
                />
              ))}
            </Stepper>
          </GridItem>
          <GridItem colSpan={2} padding={1} style={{ overflowY: "hidden" }}>
            {renderActiveContent()}
          </GridItem>
        </GridLayout>
      </StackLayout>
      <CancelWarningDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          reset();
          setCancelOpen(false);
        }}
      />
      <AccountCreatedSuccessDialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          if (!open) {
            reset();
            setSuccessOpen(false);
          }
        }}
        onConfirm={() => {
          reset();
          setSuccessOpen(false);
        }}
      />
    </>
  );
};

export const Modal = () => {
  type WizardState = "form" | "cancel-warning" | "success";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);
  const {
    activeStep,
    formData,
    setFormData,
    stepValidation,
    fieldValidation,
    validateCurrentStep,
    next,
    previous,
    reset,
    setValidationByStep,
  } = useWizard(WIZARD_STEPS);

  const handleWizardOpen = () => {
    reset();
    setWizardState("form");
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => setOpen(value);

  const handleCancel = () => {
    setOpen(false);
    setTimeout(() => {
      reset();
      setWizardState("form");
    }, 300);
  };

  const createAccount = () => setWizardState("success");
  const cancelWarning = () => setWizardState("cancel-warning");
  const backToForm = () => setWizardState("form");
  const stepId = WIZARD_STEPS[activeStep].id;

  const persistValidation = (data: AccountFormData, id: ContentType) => {
    const { fieldValidation: fv, stepStatus } = validateStep(id, data);
    setValidationByStep((prev) => ({
      ...prev,
      [id]: { fields: fv, status: stepStatus },
    }));
  };

  const handleNextClick = () => {
    const isLast = activeStep === WIZARD_STEPS.length - 1;
    if (!validateCurrentStep()) return;
    if (isLast) createAccount();
    else next();
  };

  const handlePreviousClick = () => {
    if (activeStep === 0) return;
    previous();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepFieldRules[stepId][name]) {
      persistValidation(nextData, stepId);
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepFieldRules[stepId][name]) {
      persistValidation(nextData, stepId);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepFieldRules[stepId][name]) {
      persistValidation(formData, stepId);
    }
  };

  const commonProps = {
    formData,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    fieldValidation,
  };

  const renderActiveContent = () => {
    const id = WIZARD_STEPS[activeStep].id;
    switch (id) {
      case ContentTypeEnum.AccountDetails:
        return <AccountDetailsContent {...commonProps} />;
      case ContentTypeEnum.AccountType:
        return <AccountTypeContent {...commonProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <div style={{ width: "50%" }}>
            <AdditionalInfoContent {...commonProps} />
          </div>
        );
      case ContentTypeEnum.Review:
        return <ReviewAccountContent formData={formData} />;
      default:
        return null;
    }
  };

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

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNextClick}>
      {activeStep === WIZARD_STEPS.length - 1 ? "Create" : "Next"}
    </Button>
  );
  const prevBtn = activeStep > 0 && (
    <Button
      sentiment="accented"
      appearance="bordered"
      onClick={handlePreviousClick}
    >
      Previous
    </Button>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleWizardOpen}>
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
                  <DialogContent>
                    <GridLayout rows={1} columns={1} style={{ height: "100%" }}>
                      <GridItem
                        horizontalAlignment="center"
                        verticalAlignment="center"
                      >
                        <CancelWarningContent />
                      </GridItem>
                    </GridLayout>
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
                  <DialogContent>
                    <GridLayout rows={1} columns={1} style={{ height: "100%" }}>
                      <GridItem
                        horizontalAlignment="center"
                        verticalAlignment="center"
                      >
                        <AccountCreatedContent />
                      </GridItem>
                    </GridLayout>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      sentiment="accented"
                      onClick={handleCancel}
                      autoFocus
                    >
                      Done
                    </Button>
                  </DialogActions>
                </>
              );
            default:
              return (
                <>
                  <DialogHeader
                    header={WIZARD_STEPS[activeStep].label}
                    preheader="Create a new account"
                    actions={
                      <Stepper orientation="horizontal" style={{ width: 300 }}>
                        {WIZARD_STEPS.map((step, index) => (
                          <Step
                            key={step.id}
                            label={step.label}
                            status={stepValidation[step.id]?.status}
                            stage={getStepStatus(index, activeStep)}
                          />
                        ))}
                      </Stepper>
                    }
                  />
                  <DialogContent>
                    <FlowLayout
                      as="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNextClick();
                      }}
                    >
                      {renderActiveContent()}
                    </FlowLayout>
                  </DialogContent>
                  <DialogActions>
                    {direction === "column" ? (
                      <StackLayout gap={1} style={{ width: "100%" }}>
                        {nextBtn}
                        {prevBtn}
                        {cancel}
                      </StackLayout>
                    ) : (
                      <FlexLayout gap={1}>
                        {cancel}
                        {prevBtn}
                        {nextBtn}
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
