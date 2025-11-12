import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FlexItem,
  FlexLayout,
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
import React, {
  type ElementType,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Yup from "yup";
import { useWizard, type ValidationStatus } from "./useWizard";

export default {
  title: "Patterns/Wizard",
} as Meta;
import "./wizard.stories.css";
import clsx from "clsx";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
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

const wizardSteps: { id: ContentType; label: string; description?: string }[] =
  [
    { id: "account-details", label: "Account details" },
    { id: "account-type", label: "Account type" },
    {
      id: "additional-info",
      label: "Additional info",
      description: "(Optional)",
    },
    { id: "review", label: "Review and create" },
  ];

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

interface AccountFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  accountType: string;
  initialDeposit: string;
  beneficiaryName: string;
  sourceOfFunds: string;
  paperlessStatements: string;
}

const initialFormData: AccountFormData = {
  fullName: "Jane Doe",
  phoneNumber: "+1 (212) 555-0100",
  emailAddress: "jane.doe@email.com",
  address1: "25 Bank Street",
  address2: "",
  postalCode: "E14 5JP",
  city: "London",
  country: "United Kingdom",
  accountType: "",
  initialDeposit: "",
  beneficiaryName: "",
  sourceOfFunds: "",
  paperlessStatements: "",
};

export type ContentType =
  | "account-details"
  | "account-type"
  | "additional-info"
  | "review";

// Account validation schema
const stepValidationSchemas: Record<ContentType, Yup.ObjectSchema<any>> = {
  "account-details": Yup.object({
    fullName: Yup.string().required("Full name is required."),
    phoneNumber: Yup.string().required("Phone number is required."),
    emailAddress: Yup.string()
      .email("Email format looks incorrect.")
      .required("Email is required."),
    address1: Yup.string().required("Address is required."),
    postalCode: Yup.string().required("Postal code is required."),
    city: Yup.string().required("City is required."),
    country: Yup.string().required("Country is required."),
  }),
  "account-type": Yup.object({
    accountType: Yup.string().required("Account type is required."),
  }),
  "additional-info": Yup.object({
    initialDeposit: Yup.string().test(
      "min-deposit",
      "Recommended minimum deposit is $100. You may proceed, but some features may be unavailable.",
      (value) => !value || Number(value) >= 100,
    ),
  }),
  review: Yup.object({}), // No validation
};

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
    window?.requestAnimationFrame(() => {
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
    <StackLayout style={style}>
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

const AccountDetailsContent = ({
  formData,
  stepFieldValidation,
  handleInputChange,
  handleInputBlur,
  handleSelectChange,
}: FormContentProps) => {
  return (
    <GridLayout columns={2} style={{ width: "100%" }}>
      <GridItem>
        <StackLayout>
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
          <FormField validationStatus={stepFieldValidation.phoneNumber?.status}>
            <FormFieldLabel>Phone Number</FormFieldLabel>
            <Input
              inputProps={{
                name: "phoneNumber",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.phoneNumber,
              }}
            />
            {stepFieldValidation.phoneNumber?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.phoneNumber.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField
            validationStatus={stepFieldValidation.emailAddress?.status}
          >
            <FormFieldLabel>Email Address</FormFieldLabel>
            <Input
              inputProps={{
                name: "emailAddress",
                onChange: handleInputChange,
                onBlur: handleInputBlur,
                value: formData.emailAddress,
              }}
            />
            {stepFieldValidation.emailAddress?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.emailAddress.message}
              </FormFieldHelperText>
            )}
          </FormField>
        </StackLayout>
      </GridItem>

      <GridItem>
        <StackLayout>
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
            <FormField
              validationStatus={stepFieldValidation.postalCode?.status}
            >
              <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
              <Input
                inputProps={{
                  name: "postalCode",
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  value: formData.postalCode,
                }}
              />
              {stepFieldValidation.postalCode?.status && (
                <FormFieldHelperText>
                  {stepFieldValidation.postalCode.message}
                </FormFieldHelperText>
              )}
            </FormField>
            <FormField validationStatus={stepFieldValidation.city?.status}>
              <FormFieldLabel>Town/City</FormFieldLabel>
              <Input
                inputProps={{
                  name: "city",
                  onChange: handleInputChange,
                  onBlur: handleInputBlur,
                  value: formData.city,
                }}
              />
              {stepFieldValidation.city?.status ? (
                <FormFieldHelperText>
                  {stepFieldValidation.city.message}
                </FormFieldHelperText>
              ) : (
                <FormFieldHelperText>
                  Locality, Settlement etc.
                </FormFieldHelperText>
              )}
            </FormField>
          </FlexLayout>

          <FormField validationStatus={stepFieldValidation.country?.status}>
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
            {stepFieldValidation.country?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.country.message}
              </FormFieldHelperText>
            )}
          </FormField>
        </StackLayout>
      </GridItem>
    </GridLayout>
  );
};

const ReviewAccountContent = ({ formData }: { formData: AccountFormData }) => (
  <GridLayout columns={2}>
    <GridItem>
      <StackLayout>
        <Text styleAs="h3">Account details</Text>
        <StackLayout>
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
          <FormField necessity="optional">
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
              <FormFieldHelperText>
                Locality, Settlement etc.
              </FormFieldHelperText>
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
      </StackLayout>
    </GridItem>

    <GridItem>
      <StackLayout gap={5}>
        <StackLayout>
          <Text styleAs="h3">Account type</Text>
          <StackLayout>
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
          </StackLayout>
        </StackLayout>

        <StackLayout>
          <Text styleAs="h3">Additional info</Text>
          <StackLayout>
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
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </GridItem>
  </GridLayout>
);

export const Horizontal = () => {
  const {
    activeStepIndex,
    currentStepId,
    formData,
    setFormData,
    stepsStatusMap,
    next,
    previous,
    reset,
    stepFieldValidation,
    validateCurrentStep,
  } = useWizard({
    steps: wizardSteps,
    initialData: initialFormData,
    schema: stepValidationSchemas,
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (!navigatedRef.current) {
      return;
    }
    navigatedRef.current = false;
    stepHeadingRef.current?.focus();
  }, [activeStepIndex]);

  const isLastStep = activeStepIndex === wizardSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      return;
    }
    if (isLastStep) {
      setSuccessOpen(true);
      return;
    }
    navigatedRef.current = true;
    next();
  };

  const handlePrevious = () => {
    navigatedRef.current = true;
    previous();
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    const isValid = await validateCurrentStep(newFormData);
  };

  const handleInputBlur = async () => {
    await validateCurrentStep();
  };

  const handleSelectChange = async (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
    await validateCurrentStep();
  };

  const sharedFormProps = {
    formData,
    stepFieldValidation,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
  };

  const contentByStep = {
    "account-details": <AccountDetailsContent {...sharedFormProps} />,
    "account-type": <AccountTypeContent {...sharedFormProps} />,
    "additional-info": (
      <AdditionalInfoContent {...sharedFormProps} style={{ width: "50%" }} />
    ),
    review: <ReviewAccountContent formData={formData} />,
  };

  const header = (
    <FlexLayout justify="space-between" style={{ minHeight: "6rem" }}>
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
          </Text>
          {wizardSteps[activeStepIndex].id === "additional-info" && (
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
              description={step.description}
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
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={handlePrevious}
        >
          Previous
        </Button>
      )}
      <Button sentiment="accented" onClick={handleNext}>
        {isLastStep ? "Create" : "Next"}
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
