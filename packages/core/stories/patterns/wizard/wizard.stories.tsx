import {
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
  stepValidationRules,
  useWizard,
  type ValidationStatus,
  validateStepData,
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
  stepFieldValidation: Record<string, FieldValidation>;
  updateStepValidation: (data: AccountFormData, stepId: ContentType) => void;
}

interface FormContentProps {
  formData: AccountFormData;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  stepFieldValidation: {
    [field: string]: { status?: ValidationStatus; message?: string };
  };
  handleSelectChange?: (value: string, name: string) => void;
}

const wizardSteps = [
  { id: ContentTypeEnum.AccountDetails, label: "Account details" },
  { id: ContentTypeEnum.AccountType, label: "Account type" },
  { id: ContentTypeEnum.AdditionalInfo, label: "Additional info" },
  { id: ContentTypeEnum.Review, label: "Review and create" },
] as const;

const accountTypeOptions: {
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

const getStepStage = (index: number, activeStepIndex: number) => {
  if (index === activeStepIndex) return "active";
  if (index < activeStepIndex) return "completed";
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
  stepFieldValidation,
}: FormContentProps) => {
  return (
    <FlowLayout>
      <FormField validationStatus={stepFieldValidation.initialDeposit?.status}>
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
        {stepFieldValidation.initialDeposit?.status && (
          <FormFieldHelperText>
            {stepFieldValidation.initialDeposit.message}
          </FormFieldHelperText>
        )}
      </FormField>
      <FormField>
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
      <FormField>
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
      <FormField>
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
  stepFieldValidation,
  updateStepValidation,
}: FormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(formData, stepId);
    }
  };
  const onSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };

  return (
    <StackLayout gap={3} style={{ height: "100%" }}>
      <FlexItem grow={1} style={{ width: "50%" }}>
        <AdditionalInfoContent
          formData={formData}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
          handleSelectChange={handleSelectChange}
          stepFieldValidation={stepFieldValidation}
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

        <Button sentiment="accented" onClick={onSubmitForm}>
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

const AccountTypeContent = ({
  handleInputBlur,
  formData,
  stepFieldValidation,
  handleInputChange,
}: FormContentProps) => {
  return (
    <FormField validationStatus={stepFieldValidation.accountType?.status}>
      <FormFieldLabel>Select Account Type</FormFieldLabel>
      <RadioButtonGroup
        direction="vertical"
        onChange={handleInputChange}
        value={formData.accountType}
      >
        {accountTypeOptions.map(({ value, title, subtitle }) => (
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
      {stepFieldValidation.accountType?.status && (
        <FormFieldHelperText>
          {stepFieldValidation.accountType.message}
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
  stepFieldValidation,
  updateStepValidation,
}: FormProps) => {
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    const nextData = { ...formData, accountType: value };
    setFormData(nextData);
    updateStepValidation(nextData, stepId);
  };
  const handleInputBlur = () => {
    updateStepValidation(formData, stepId);
  };
  const onSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };
  return (
    <StackLayout gap={3} style={{ height: "100%" }}>
      <FlexItem grow={1}>
        <AccountTypeContent
          formData={formData}
          handleInputBlur={handleInputBlur}
          stepFieldValidation={stepFieldValidation}
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

        <Button sentiment="accented" onClick={onSubmitForm}>
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

const AccountDetailsContent = ({
  formData,
  stepFieldValidation,
  handleInputChange,
  handleInputBlur,
  handleSelectChange,
}: FormContentProps) => {
  return (
    <GridLayout columns={2} gap={3} style={{ width: "100%" }}>
      <GridItem>
        <StackLayout gap={3}>
          <FormField validationStatus={stepFieldValidation.fullName?.status}>
            <FormFieldLabel>Full name</FormFieldLabel>
            <Input
              inputProps={{
                name: "fullName",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.fullName,
              }}
            />
            {stepFieldValidation.fullName?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.fullName.message}
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
          <FormField validationStatus={stepFieldValidation.address1?.status}>
            <FormFieldLabel>Address 1</FormFieldLabel>
            <Input
              inputProps={{
                name: "address1",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.address1,
              }}
            />
            {stepFieldValidation.address1?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.address1.message}
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
  stepFieldValidation,
  updateStepValidation,
}: FormProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(formData, stepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };

  const onSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleNext) return;
    handleNext();
  };

  return (
    <StackLayout gap={3} style={{ height: "100%" }}>
      <FlexItem grow={1}>
        <AccountDetailsContent
          formData={formData}
          handleInputBlur={handleInputBlur}
          stepFieldValidation={stepFieldValidation}
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
        <Button sentiment="accented" onClick={onSubmitForm}>
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
            {accountTypeOptions.map(({ value, title, subtitle }) => (
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
    <StackLayout gap={3} style={{ height: "100%" }}>
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

        <Button sentiment="accented" onClick={handleSubmit}>
          Create
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const Horizontal = () => {
  const {
    activeStepIndex,
    formData,
    setFormData,
    stepsStatusMap,
    next,
    previous,
    reset,
    setStepValidations,
    stepFieldValidation,
    validateCurrentStep,
  } = useWizard(wizardSteps);
  const [successOpen, setSuccessOpen] = useState(false);

  const updateStepValidation = (data: AccountFormData, stepId: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(stepId, data);
    setStepValidations((prev) => ({
      ...prev,
      [stepId]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    next();
  };

  const sharedFormProps = {
    formData,
    setFormData,
    handleCancel: reset,
    handleNext,
    handlePrevious: previous,
    stepFieldValidation,
    updateStepValidation,
    stepsStatusMap,
  };

  const renderActiveContent = () => {
    const currentStepId = wizardSteps[activeStepIndex].id;
    switch (currentStepId) {
      case ContentTypeEnum.AccountDetails:
        return (
          <AccountDetailsForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.AccountType:
        return <AccountTypeForm stepId={currentStepId} {...sharedFormProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <AdditionalInfoForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.Review:
        return (
          <ReviewAccountForm stepId={currentStepId} {...sharedFormProps} />
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
          {wizardSteps[activeStepIndex].label}
        </Text>
        {wizardSteps[activeStepIndex].id === ContentTypeEnum.AdditionalInfo && (
          <Text
            style={{
              color: "var(--salt-content-secondary-foreground)",
              marginTop: "var(--salt-spacing-fixed-400)",
            }}
          >
            All fields are optional
          </Text>
        )}
      </Text>

      <Stepper orientation="horizontal" style={{ width: 340 }}>
        {wizardSteps.map((step, index) => (
          <Step
            key={step.id}
            label={step.label}
            status={stepsStatusMap[step.id]?.status}
            stage={getStepStage(index, activeStepIndex)}
          />
        ))}
      </Stepper>
    </FlexLayout>
  );

  return (
    <>
      <StackLayout
        style={{
          width: 730,
          height: 588,
        }}
        gap={0}
      >
        <FlexItem padding={3} style={{ paddingBottom: 0 }}>
          {header}
        </FlexItem>
        <FlexItem
          grow={1}
          style={{
            overflowY: "hidden",
          }}
          padding={3}
        >
          {renderActiveContent()}
        </FlexItem>
      </StackLayout>
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

      <Banner
        status="warning"
        style={{ marginTop: "var(--salt-spacing-fixed-900)" }}
      >
        <BannerContent>
          Wizard has not been optimized for mobile or smaller screens
        </BannerContent>
      </Banner>
    </>
  );
};
export const HorizontalWithCancelConfirmation = () => {
  const {
    activeStepIndex,
    formData,
    setFormData,
    stepsStatusMap,
    next,
    previous,
    reset,
    setStepValidations,
    stepFieldValidation,
    validateCurrentStep,
  } = useWizard(wizardSteps);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const updateStepValidation = (data: AccountFormData, stepId: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(stepId, data);
    setStepValidations((prev) => ({
      ...prev,
      [stepId]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    next();
  };

  const sharedFormProps = {
    formData,
    setFormData,
    handleCancel: () => setCancelOpen(true),
    handleNext,
    handlePrevious: previous,
    stepFieldValidation,
    updateStepValidation,
    stepsStatusMap,
  };

  const handleSuccess = () => setSuccessOpen(true);

  const renderActiveContent = () => {
    const currentStepId = wizardSteps[activeStepIndex].id;
    switch (currentStepId) {
      case ContentTypeEnum.AccountDetails:
        return (
          <AccountDetailsForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.AccountType:
        return <AccountTypeForm stepId={currentStepId} {...sharedFormProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <AdditionalInfoForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.Review:
        return (
          <ReviewAccountForm
            stepId={currentStepId}
            {...sharedFormProps}
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
          {wizardSteps[activeStepIndex].label}
        </Text>
        {wizardSteps[activeStepIndex].id === ContentTypeEnum.AdditionalInfo && (
          <Text
            style={{
              color: "var(--salt-content-secondary-foreground)",
              marginTop: "var(--salt-spacing-fixed-400)",
            }}
          >
            All fields are optional
          </Text>
        )}
      </Text>

      <Stepper orientation="horizontal" style={{ width: 340 }}>
        {wizardSteps.map((step, index) => (
          <Step
            key={step.id}
            label={step.label}
            status={stepsStatusMap[step.id]?.status}
            stage={getStepStage(index, activeStepIndex)}
          />
        ))}
      </Stepper>
    </FlexLayout>
  );

  return (
    <>
      <StackLayout
        style={{
          width: 730,
          height: 588,
        }}
        gap={0}
      >
        <FlexItem padding={3} style={{ paddingBottom: 0 }}>
          {header}
        </FlexItem>
        <FlexItem
          grow={1}
          style={{
            overflowY: "hidden",
          }}
          padding={3}
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

      <Banner
        status="warning"
        style={{ marginTop: "var(--salt-spacing-fixed-900)" }}
      >
        <BannerContent>
          Wizard has not been optimized for mobile or smaller screens
        </BannerContent>
      </Banner>
    </>
  );
};

export const VerticalWithCancelConfirmation = () => {
  const {
    activeStepIndex,
    formData,
    setFormData,
    stepsStatusMap,
    next,
    previous,
    reset,
    setStepValidations,
    validateCurrentStep,
    stepFieldValidation,
  } = useWizard(wizardSteps);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSuccess = () => setSuccessOpen(true);

  const updateStepValidation = (data: AccountFormData, stepId: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(stepId, data);
    setStepValidations((prev) => ({
      ...prev,
      [stepId]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    next();
  };

  const sharedFormProps = {
    formData,
    setFormData,
    handleCancel: () => setCancelOpen(true),
    handleNext,
    handlePrevious: previous,
    stepFieldValidation,
    updateStepValidation,
    stepsStatusMap,
  };

  const renderActiveContent = () => {
    const currentStepId = wizardSteps[activeStepIndex].id;
    switch (currentStepId) {
      case ContentTypeEnum.AccountDetails:
        return (
          <AccountDetailsForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.AccountType:
        return <AccountTypeForm stepId={currentStepId} {...sharedFormProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <AdditionalInfoForm stepId={currentStepId} {...sharedFormProps} />
        );
      case ContentTypeEnum.Review:
        return (
          <ReviewAccountForm
            stepId={currentStepId}
            {...sharedFormProps}
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
        {wizardSteps[activeStepIndex].label}
      </Text>
      {wizardSteps[activeStepIndex].id === ContentTypeEnum.AdditionalInfo && (
        <Text
          style={{
            color: "var(--salt-content-secondary-foreground)",
            marginTop: "var(--salt-spacing-fixed-400)",
          }}
        >
          All fields are optional
        </Text>
      )}
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
              {wizardSteps.map((step, index) => (
                <Step
                  key={step.id}
                  label={step.label}
                  status={stepsStatusMap[step.id]?.status}
                  stage={getStepStage(index, activeStepIndex)}
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
      <Banner
        status="warning"
        style={{ marginTop: "var(--salt-spacing-fixed-900)" }}
      >
        <BannerContent>
          Wizard has not been optimized for mobile or smaller screens
        </BannerContent>
      </Banner>
    </>
  );
};

export const Modal = () => {
  const [open, setOpen] = useState(false);
  const {
    activeStepIndex,
    formData,
    setFormData,
    stepsStatusMap,
    stepFieldValidation,
    validateCurrentStep,
    next,
    previous,
    reset,
    setStepValidations,
  } = useWizard(wizardSteps);

  const openWizard = () => {
    reset();
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => setOpen(value);

  const closeWizardAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      reset();
    }, 300);
  };

  const stepId = wizardSteps[activeStepIndex].id;

  const updateStepValidation = (data: AccountFormData, id: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(id, data);
    setStepValidations((prev) => ({
      ...prev,
      [id]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const handleNextClick = () => {
    const isLast = activeStepIndex === wizardSteps.length - 1;
    if (!validateCurrentStep()) return;
    if (isLast) closeWizardAndReset();
    else next();
  };

  const handlePreviousClick = () => {
    if (activeStepIndex === 0) return;
    previous();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(formData, stepId);
    }
  };

  const sharedFormProps = {
    formData,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    stepFieldValidation,
  };

  const renderActiveContent = () => {
    const currentStepId = wizardSteps[activeStepIndex].id;
    switch (currentStepId) {
      case ContentTypeEnum.AccountDetails:
        return <AccountDetailsContent {...sharedFormProps} />;
      case ContentTypeEnum.AccountType:
        return <AccountTypeContent {...sharedFormProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <div style={{ width: "50%" }}>
            <AdditionalInfoContent {...sharedFormProps} />
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
      onClick={closeWizardAndReset}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNextClick}>
      {activeStepIndex === wizardSteps.length - 1 ? "Create" : "Next"}
    </Button>
  );
  const prevBtn = activeStepIndex > 0 && (
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
      <Button data-testid="dialog-button" onClick={openWizard}>
        Open wizard
      </Button>
      <Banner
        status="warning"
        style={{ marginTop: "var(--salt-spacing-fixed-900)" }}
      >
        <BannerContent>
          Wizard has not been optimized for mobile or smaller screens
        </BannerContent>
      </Banner>
      <Dialog open={open} onOpenChange={onOpenChange} style={{ height: 588 }}>
        <DialogHeader
          header={wizardSteps[activeStepIndex].label}
          preheader="Create a new account"
          actions={
            <Stepper orientation="horizontal" style={{ width: 300 }}>
              {wizardSteps.map((step, index) => (
                <Step
                  key={step.id}
                  label={step.label}
                  status={stepsStatusMap[step.id]?.status}
                  stage={getStepStage(index, activeStepIndex)}
                />
              ))}
            </Stepper>
          }
        />

        <DialogContent>
          <FlowLayout>{renderActiveContent()}</FlowLayout>
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
      </Dialog>
    </>
  );
};

export const ModalWithConfirmations = () => {
  type WizardState = "form" | "cancel-warning" | "success";
  const [wizardState, setWizardState] = useState<WizardState>("form");
  const [open, setOpen] = useState(false);
  const {
    activeStepIndex,
    formData,
    setFormData,
    stepsStatusMap,
    stepFieldValidation,
    validateCurrentStep,
    next,
    previous,
    reset,
    setStepValidations,
  } = useWizard(wizardSteps);

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

  const createAccount = () => setWizardState("success");
  const showCancelWarning = () => setWizardState("cancel-warning");
  const backToForm = () => setWizardState("form");
  const stepId = wizardSteps[activeStepIndex].id;
  const isLast = activeStepIndex === wizardSteps.length - 1;

  const onOpenChange = (value: boolean) => {
    if (!value && !isLast) {
      showCancelWarning();
      return;
    }
    setOpen(value);
  };

  const updateStepValidation = (data: AccountFormData, id: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(id, data);
    setStepValidations((prev) => ({
      ...prev,
      [id]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const handleNextClick = () => {
    if (!validateCurrentStep()) return;
    if (isLast) createAccount();
    else next();
  };

  const handlePreviousClick = () => {
    if (activeStepIndex === 0) return;
    previous();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(nextData, stepId);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[stepId][name]) {
      updateStepValidation(formData, stepId);
    }
  };

  const sharedFormProps = {
    formData,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    stepFieldValidation,
  };

  const renderActiveContent = () => {
    const currentStepId = wizardSteps[activeStepIndex].id;
    switch (currentStepId) {
      case ContentTypeEnum.AccountDetails:
        return <AccountDetailsContent {...sharedFormProps} />;
      case ContentTypeEnum.AccountType:
        return <AccountTypeContent {...sharedFormProps} />;
      case ContentTypeEnum.AdditionalInfo:
        return (
          <div style={{ width: "50%" }}>
            <AdditionalInfoContent {...sharedFormProps} />
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
      onClick={showCancelWarning}
    >
      Cancel
    </Button>
  );

  const nextBtn = (
    <Button sentiment="accented" onClick={handleNextClick}>
      {activeStepIndex === wizardSteps.length - 1 ? "Create" : "Next"}
    </Button>
  );
  const prevBtn = activeStepIndex > 0 && (
    <Button
      sentiment="accented"
      appearance="bordered"
      onClick={handlePreviousClick}
    >
      Previous
    </Button>
  );

  const wizardStatus =
    wizardState === "cancel-warning"
      ? "warning"
      : wizardState === "success"
        ? "success"
        : undefined;

  return (
    <>
      <Button data-testid="dialog-button" onClick={openWizard}>
        Open wizard
      </Button>
      <Banner
        status="warning"
        style={{ marginTop: "var(--salt-spacing-fixed-900)" }}
      >
        <BannerContent>
          Wizard has not been optimized for mobile or smaller screens
        </BannerContent>
      </Banner>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status={wizardStatus}
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
                        <Button
                          sentiment="accented"
                          onClick={closeWizardAndReset}
                        >
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
                        <Button
                          sentiment="accented"
                          onClick={closeWizardAndReset}
                        >
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
                      onClick={closeWizardAndReset}
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
                    header={wizardSteps[activeStepIndex].label}
                    preheader="Create a new account"
                    actions={
                      <Stepper orientation="horizontal" style={{ width: 300 }}>
                        {wizardSteps.map((step, index) => (
                          <Step
                            key={step.id}
                            label={step.label}
                            status={stepsStatusMap[step.id]?.status}
                            stage={getStepStage(index, activeStepIndex)}
                          />
                        ))}
                      </Stepper>
                    }
                  />

                  <DialogContent>
                    <FlowLayout>{renderActiveContent()}</FlowLayout>
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
