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
  useIsomorphicLayoutEffect,
  useResizeObserver,
  useResponsiveProp,
} from "@salt-ds/core";
import { SuccessCircleSolidIcon, WarningSolidIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import React, { type ElementType, useCallback, useRef, useState } from "react";
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

const mobileWarningBanner = (
  <Banner status="warning">
    <BannerContent>
      Wizard is not optimized for mobile or smaller screens
    </BannerContent>
  </Banner>
);

export default {
  title: "Patterns/Wizard",
  decorators: [
    (story) => (
      <>
        <div className="mobileBanner">{mobileWarningBanner}</div>
        {story()}
      </>
    ),
  ],
} as Meta;
import "./wizard.stories.css";
import clsx from "clsx";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

interface FormProps {
  stepId: ContentType;
  formData: AccountFormData;
  setFormData: () => void;
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
  style?: React.CSSProperties;
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

const ContentOverflow = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const targetWindow = window;
    targetWindow?.requestAnimationFrame(() => {
      const container = divRef.current;
      if (!container) return;
      setCanScrollUp(container.scrollTop > 0);
      setCanScrollDown(
        container.scrollHeight - container.scrollTop - container.clientHeight >
          1,
      );
    });
  };

  const checkOverflow = useCallback(() => {
    if (!divRef.current) return;
    setIsOverflowing(divRef.current.scrollHeight > divRef.current.offsetHeight);
  }, []);

  useResizeObserver({ ref: divRef, onResize: checkOverflow });

  useIsomorphicLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow]);

  const withBaseName = (name = "") =>
    `overflowContent${name ? `-${name}` : ""}`;

  return (
    <div className={clsx(withBaseName, className)}>
      <div
        style={style}
        onScrollCapture={handleScroll}
        ref={divRef}
        className={clsx(withBaseName("inner"), {
          [withBaseName("scrollTop")]: isOverflowing && canScrollUp,
          [withBaseName("scrollBottom")]: isOverflowing && canScrollDown,
        })}
      >
        {children}
      </div>
    </div>
  );
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
  style,
}: FormContentProps) => {
  return (
    <FlowLayout style={style}>
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
            type: "number",
          }}
          inputMode="decimal"
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
                type: "number",
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
              <Option value="">Please select</Option>
              <Option value="Yes" />
              <Option value="No" />
            </Dropdown>
          </FormField>
        </FlowLayout>
      </StackLayout>
    </GridItem>
  </GridLayout>
);

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

  const currentStepId = wizardSteps[activeStepIndex].id;
  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(formData, currentStepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const onSubmitForm = () => {
    if (isLastStep) {
      setSuccessOpen(true);
      return;
    }
    if (!validateCurrentStep()) return;
    next();
  };

  const sharedFormProps = {
    formData,
    stepFieldValidation,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
  };

  const contentByStep = {
    [ContentTypeEnum.AccountDetails]: (
      <AccountDetailsContent {...sharedFormProps} />
    ),
    [ContentTypeEnum.AccountType]: <AccountTypeContent {...sharedFormProps} />,
    [ContentTypeEnum.AdditionalInfo]: (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    [ContentTypeEnum.Review]: <ReviewAccountContent formData={formData} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <Text>
          Create a new account
          <Text color="primary" styleAs="h2">
            {wizardSteps[activeStepIndex].label}
          </Text>
          {wizardSteps[activeStepIndex].id ===
            ContentTypeEnum.AdditionalInfo && (
            <Text
              color="secondary"
              style={{
                marginTop: "var(--salt-spacing-fixed-400)",
              }}
            >
              All fields are optional
            </Text>
          )}
        </Text>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper orientation="horizontal">
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              label={step.label}
              status={stepsStatusMap[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
            />
          ))}
        </Stepper>
      </FlexItem>
    </FlexLayout>
  );

  const footer = (
    <FlexLayout gap={1} justify="end" padding={3}>
      <Button sentiment="accented" appearance="transparent" onClick={reset}>
        Cancel
      </Button>
      {!isFirstStep && (
        <Button sentiment="accented" appearance="bordered" onClick={previous}>
          Previous
        </Button>
      )}
      <Button sentiment="accented" onClick={onSubmitForm}>
        Next
      </Button>
    </FlexLayout>
  );

  return (
    <>
      <StackLayout
        style={{
          width: 730,
        }}
        gap={0}
      >
        <FlexItem padding={3}>{header}</FlexItem>
        <FlexItem grow={1}>
          <ContentOverflow style={{ height: 396 }}>
            {contentByStep[currentStepId]}
          </ContentOverflow>
        </FlexItem>
        {footer}
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

  const currentStepId = wizardSteps[activeStepIndex].id;
  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(formData, currentStepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const onSubmitForm = () => {
    if (isLastStep) {
      setSuccessOpen(true);
      return;
    }
    if (!validateCurrentStep()) return;
    next();
  };

  const sharedFormProps = {
    formData,
    stepFieldValidation,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
  };

  const openCancelDialog = () => setCancelOpen(true);

  const contentByStep = {
    [ContentTypeEnum.AccountDetails]: (
      <AccountDetailsContent {...sharedFormProps} />
    ),
    [ContentTypeEnum.AccountType]: <AccountTypeContent {...sharedFormProps} />,
    [ContentTypeEnum.AdditionalInfo]: (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    [ContentTypeEnum.Review]: <ReviewAccountContent formData={formData} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
      <FlexItem style={{ flex: 1 }}>
        <Text>
          Create a new account
          <Text color="primary" styleAs="h2">
            {wizardSteps[activeStepIndex].label}
          </Text>
          {wizardSteps[activeStepIndex].id ===
            ContentTypeEnum.AdditionalInfo && (
            <Text
              color="secondary"
              style={{
                marginTop: "var(--salt-spacing-fixed-400)",
              }}
            >
              All fields are optional
            </Text>
          )}
        </Text>
      </FlexItem>
      <FlexItem style={{ flex: 1 }}>
        <Stepper orientation="horizontal">
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              label={step.label}
              status={stepsStatusMap[step.id]?.status}
              stage={getStepStage(index, activeStepIndex)}
            />
          ))}
        </Stepper>
      </FlexItem>
    </FlexLayout>
  );

  const footer = (
    <FlexLayout gap={1} justify="end" padding={3}>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={openCancelDialog}
      >
        Cancel
      </Button>

      {!isFirstStep && (
        <Button sentiment="accented" appearance="bordered" onClick={previous}>
          Previous
        </Button>
      )}

      <Button sentiment="accented" onClick={onSubmitForm}>
        Next
      </Button>
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
        <FlexItem padding={3}>{header}</FlexItem>
        <FlexItem grow={1}>
          <ContentOverflow style={{ height: 396 }}>
            {contentByStep[currentStepId]}
          </ContentOverflow>
        </FlexItem>
        {footer}
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

  const updateStepValidation = (data: AccountFormData, stepId: ContentType) => {
    const { stepFieldValidation, stepStatus } = validateStepData(stepId, data);
    setStepValidations((prev) => ({
      ...prev,
      [stepId]: { fields: stepFieldValidation, status: stepStatus },
    }));
  };

  const currentStepId = wizardSteps[activeStepIndex].id;
  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(formData, currentStepId);
    }
  };
  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const onSubmitForm = () => {
    if (isLastStep) {
      setSuccessOpen(true);
      return;
    }
    if (!validateCurrentStep()) return;
    next();
  };

  const openCancelDialog = () => setCancelOpen(true);

  const sharedFormProps = {
    formData,
    stepFieldValidation,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
  };

  const contentByStep = {
    [ContentTypeEnum.AccountDetails]: (
      <AccountDetailsContent {...sharedFormProps} />
    ),
    [ContentTypeEnum.AccountType]: <AccountTypeContent {...sharedFormProps} />,
    [ContentTypeEnum.AdditionalInfo]: (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    [ContentTypeEnum.Review]: <ReviewAccountContent formData={formData} />,
  };

  const header = (
    <StackLayout gap={0} style={{ minHeight: "5rem" }}>
      <Text>Create a new account</Text>
      <Text color="primary" styleAs="h2">
        {wizardSteps[activeStepIndex].label}
      </Text>
      {wizardSteps[activeStepIndex].id === ContentTypeEnum.AdditionalInfo && (
        <Text
          color="secondary"
          style={{
            marginTop: "var(--salt-spacing-fixed-400)",
          }}
        >
          All fields are optional
        </Text>
      )}
    </StackLayout>
  );

  const footer = (
    <FlexLayout gap={1} justify="end" padding={3} style={{ paddingTop: 0 }}>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={openCancelDialog}
      >
        Cancel
      </Button>

      {!isFirstStep && (
        <Button sentiment="accented" appearance="bordered" onClick={previous}>
          Previous
        </Button>
      )}

      <Button sentiment="accented" onClick={onSubmitForm}>
        Next
      </Button>
    </FlexLayout>
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
        <ContentOverflow style={{ height: 512 }}>
          <StackLayout gap={3}>
            {header}
            <GridLayout columns={3} gap={3}>
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
              <GridItem colSpan={2} padding={1}>
                {contentByStep[currentStepId]}
              </GridItem>
            </GridLayout>
          </StackLayout>
        </ContentOverflow>
        {footer}
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

  const currentStepId = wizardSteps[activeStepIndex].id;

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
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(formData, currentStepId);
    }
  };

  const sharedFormProps = {
    formData,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    stepFieldValidation,
  };

  const contentByStep = {
    [ContentTypeEnum.AccountDetails]: (
      <AccountDetailsContent {...sharedFormProps} />
    ),
    [ContentTypeEnum.AccountType]: <AccountTypeContent {...sharedFormProps} />,
    [ContentTypeEnum.AdditionalInfo]: (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    [ContentTypeEnum.Review]: <ReviewAccountContent formData={formData} />,
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
      <Dialog open={open} onOpenChange={onOpenChange} style={{ height: 588 }}>
        <DialogHeader
          header={wizardSteps[activeStepIndex].label}
          description={
            wizardSteps[activeStepIndex].id ===
              ContentTypeEnum.AdditionalInfo && "All fields are optional"
          }
          preheader="Create a new account"
          actions={
            <Stepper orientation="horizontal" style={{ maxWidth: 300 }}>
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
          <FlowLayout>{contentByStep[currentStepId]}</FlowLayout>
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
  const currentStepId = wizardSteps[activeStepIndex].id;
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
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(nextData, currentStepId);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (stepValidationRules[currentStepId][name]) {
      updateStepValidation(formData, currentStepId);
    }
  };

  const sharedFormProps = {
    formData,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    stepFieldValidation,
  };

  const contentByStep = {
    [ContentTypeEnum.AccountDetails]: (
      <AccountDetailsContent {...sharedFormProps} />
    ),
    [ContentTypeEnum.AccountType]: <AccountTypeContent {...sharedFormProps} />,
    [ContentTypeEnum.AdditionalInfo]: (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    [ContentTypeEnum.Review]: <ReviewAccountContent formData={formData} />,
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
                    description={
                      wizardSteps[activeStepIndex].id ===
                        ContentTypeEnum.AdditionalInfo &&
                      "All fields are optional"
                    }
                    actions={
                      <Stepper
                        orientation="horizontal"
                        style={{ maxWidth: 300 }}
                      >
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
                    <FlowLayout>{contentByStep[currentStepId]}</FlowLayout>
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
