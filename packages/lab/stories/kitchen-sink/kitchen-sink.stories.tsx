import {
  Badge,
  Button,
  Card,
  ComboBox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Display1,
  Dropdown,
  FlexItem,
  FlexLayout,
  H1,
  H2,
  H3,
  Input,
  Link,
  ListBox,
  MultilineInput,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  StatusIndicator,
  Text,
  Tooltip,
  VALIDATION_NAMED_STATUS,
  type ValidationStatus,
} from "@salt-ds/core";
import { AD, GB, UN, US } from "@salt-ds/countries";
import {
  NotificationIcon,
  NotificationSolidIcon,
  SaltShakerIcon,
  SaltShakerSolidIcon,
} from "@salt-ds/icons";
import { useState } from "react";
import AgGridThemeDefault from "../../../ag-grid-theme/src/examples/Default";
import AgGridThemeHDCompact from "../../../ag-grid-theme/src/examples/HDCompact";
import AgGridThemeZebra from "../../../ag-grid-theme/src/examples/VariantZebra";
import {
  DefaultGroup as AccordionDefault,
  Status as AccordionStatus,
} from "../../../core/stories/accordion/accordion.stories";
import { Fallback as AvatarFallback } from "../../../core/stories/avatar/avatar.stories";
import {
  StatusesPrimary as BannerStatusesPrimary,
  StatusesSecondary as BannerStatusesSecondary,
} from "../../../core/stories/banner/banner.stories";
import { WithIcon as ButtonExamples } from "../../../core/stories/button/button.stories";
import { Default as CardDefault } from "../../../core/stories/card/card.stories";
import {
  Error as CheckboxError,
  HorizontalGroup as CheckboxHorizontalGroup,
  Readonly as CheckboxReadonly,
} from "../../../core/stories/checkbox/checkbox.stories";
import {
  HelperText as FormFieldHelperText,
  Readonly as FormFieldReadonly,
  WithValidation as FormFieldValidation,
  WithMultilineInputAsQuestion,
} from "../../../core/stories/form-field/form-field.stories";
import { Default as InteractableCardStory } from "../../../core/stories/interactable-card/interactable-card.stories";
import { Default as OverlayDefault } from "../../../core/stories/overlay/overlay.stories";
import {
  Closable as PillClosable,
  Default as PillDefault,
  Disabled as PillDisabled,
  Icon as PillIcon,
} from "../../../core/stories/pill/pill.stories";
import { Default as SegmentedButtonGroupDefault } from "../../../core/stories/segmented-button-group/segmented-button-group.stories";
import { Default as SwitchDefault } from "../../../core/stories/switch/switch.stories";
import {
  Default as ToastDefault,
  Error as ToastError,
  Warning as ToastWarning,
} from "../../../core/stories/toast/toast.stories";
import {
  Horizontal as ToggleButtonGroupHorizontal,
  HorizontalIconOnly as ToggleButtonGroupHorizontalIon,
  HorizontalTextOnly as ToggleButtonGroupHorizontalText,
} from "../../../core/stories/toggle-button-group/toggle-button-group.stories";
import {
  DatePicker,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "../../src/date-picker/";
import { NumberInput } from "../../src/number-input";

import "ag-grid-community/styles/ag-grid.css";
import "../../../../dist/salt-ds-ag-grid-theme/salt-ag-theme.css";

export default {
  title: "Experimental/Kitchen Sink",
};

const LaunchStatusDialog = () => {
  const [status, setStatus] = useState<ValidationStatus>("info");
  const [open, setOpen] = useState(false);
  const handleRequestOpen = () => {
    setOpen(true);
  };
  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const content =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";
  return (
    <>
      <RadioButtonGroup
        onChange={(e) => setStatus(e.target.value as ValidationStatus)}
        direction="horizontal"
      >
        {VALIDATION_NAMED_STATUS.map((s) => (
          <RadioButton key={s} label={s} value={s} checked={status === s} />
        ))}
      </RadioButtonGroup>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <Dialog
        role="alertdialog"
        status={status}
        open={open}
        onOpenChange={onOpenChange}
        // focus the ok instead of the cancel button
        initialFocus={1}
      >
        <DialogHeader header={status} />
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const GriActionCellRenderer = () => (
  <FlexLayout align="center" style={{ height: "100%" }} gap={1}>
    <Button variant="cta">
      <SaltShakerSolidIcon />
    </Button>
    <Button>
      <SaltShakerIcon />
    </Button>
  </FlexLayout>
);

export const Components = () => {
  return (
    <StackLayout>
      <StackLayout direction="row">
        <Card variant="primary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <H2>H2 Subheader</H2>
          <Text color="primary">Primary body copy</Text>
          <Text color="secondary">Secondary body copy</Text>
          <Text color="error">Error body copy</Text>
          <Text color="warning">Warning body copy</Text>
          <Text color="success">Success body copy</Text>
          <Text color="info">Info body copy</Text>
          <Link href="#">Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="secondary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <H2>H2 Subheader</H2>
          <Text color="primary">Primary body copy</Text>
          <Text color="secondary">Secondary body copy</Text>
          <Text color="error">Error body copy</Text>
          <Text color="warning">Warning body copy</Text>
          <Text color="success">Success body copy</Text>
          <Text color="info">Info body copy</Text>
          <Link href="#">Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="primary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <Card variant="secondary">
            <H2>H2 Subheader</H2>
            <Text color="primary">Primary body copy</Text>
            <Text color="secondary">Secondary body copy</Text>
            <Text color="error">Error body copy</Text>
            <Text color="warning">Warning body copy</Text>
            <Text color="success">Success body copy</Text>
            <Text color="info">Info body copy</Text>
          </Card>
          <Link href="#">Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="secondary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <Card variant="primary">
            <H2>H2 Subheader</H2>
            <Text color="primary">Primary body copy</Text>
            <Text color="secondary">Secondary body copy</Text>
            <Text color="error">Error body copy</Text>
            <Text color="warning">Warning body copy</Text>
            <Text color="success">Success body copy</Text>
            <Text color="info">Info body copy</Text>
          </Card>
          <Link href="#">Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
      </StackLayout>
      <StackLayout direction="row">
        <AccordionStatus />
        <AccordionDefault />
      </StackLayout>
      <StackLayout direction="row">
        <AvatarFallback size={1} />
        <AD />
        <US />
        <GB />
        <UN />
        <Badge value={1} />
        <Badge value={1000} />
        <Badge value="new" />
        <NotificationIcon />
        <NotificationSolidIcon />
        <Link href="#">Link</Link>
        <Link href="#" color="secondary">
          Link
        </Link>
        <Link href="#" color="accent">
          Link
        </Link>
        <Link href="#" target="_blank">
          Link
        </Link>
        <Link href="#" target="_blank" color="secondary">
          Link
        </Link>
        <StatusIndicator status="error" />
        <StatusIndicator status="info" />
        <StatusIndicator status="success" />
        <StatusIndicator status="warning" />
      </StackLayout>
      <StackLayout direction="row">
        <PillDefault />
        <PillDisabled />
        <PillIcon />
        <PillClosable />
      </StackLayout>
      <StackLayout direction="row">
        <BannerStatusesPrimary />
        <BannerStatusesSecondary />
      </StackLayout>
      <StackLayout direction="row">
        <ButtonExamples />
        <Button variant="cta" disabled>
          CTA
        </Button>
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
      </StackLayout>
      <StackLayout direction="row">
        <SegmentedButtonGroupDefault />
      </StackLayout>
      <StackLayout direction="row">
        <ToggleButtonGroupHorizontalText defaultValue="high" />
        <ToggleButtonGroupHorizontalIon defaultValue="light" />
        <ToggleButtonGroupHorizontal defaultValue="all" />
      </StackLayout>
      <StackLayout direction="row">
        <FlexItem>
          <ToggleButtonGroupHorizontalText
            defaultValue="high"
            orientation="vertical"
          />
        </FlexItem>
        <FlexItem>
          <ToggleButtonGroupHorizontalIon
            defaultValue="light"
            orientation="vertical"
          />
        </FlexItem>
        <FlexItem>
          <ToggleButtonGroupHorizontal
            defaultValue="all"
            orientation="vertical"
          />
        </FlexItem>
        <CardDefault variant="primary" />
        <CardDefault variant="secondary" />
        <InteractableCardStory accentPlacement="top" />
        <InteractableCardStory accentPlacement="right" variant="secondary" />
        <InteractableCardStory accentPlacement="bottom" />
        <InteractableCardStory accentPlacement="left" variant="secondary" />
      </StackLayout>
      <StackLayout direction="row">
        <CheckboxHorizontalGroup />
        <CheckboxError />
        <CheckboxReadonly />

        <SwitchDefault />
        <SwitchDefault defaultChecked />
        <SwitchDefault disabled />
        <SwitchDefault disabled defaultChecked />

        <SwitchDefault label="Switch" />
        <SwitchDefault label="Switch" defaultChecked />
        <SwitchDefault label="Switch" disabled />
        <SwitchDefault label="Switch" disabled defaultChecked />
      </StackLayout>
      <StackLayout direction="row" gap={16} style={{ marginBlock: 60 }}>
        <Tooltip content="I am a tooltip" open placement="bottom">
          <Button>Info</Button>
        </Tooltip>
        <Tooltip content="I am a tooltip" status="info" open placement="bottom">
          <Button>Info</Button>
        </Tooltip>
        <Tooltip
          content="I am a tooltip"
          status="error"
          open
          placement="bottom"
        >
          <Button>Error</Button>
        </Tooltip>
        <Tooltip
          content="I am a tooltip"
          status="warning"
          open
          placement="right"
        >
          <Button>Warning</Button>
        </Tooltip>
        <Tooltip
          content="I am a tooltip"
          status="success"
          open
          placement="right"
        >
          <Button>Success</Button>
        </Tooltip>

        <OverlayDefault />
        <OverlayDefault placement="bottom" />
      </StackLayout>
      <StackLayout direction="row">
        <FlexItem>
          <ToastDefault />
        </FlexItem>
        <ToastError />
        <ToastWarning />
        <FlexItem>
          <ToastDefault status="success" />
        </FlexItem>
      </StackLayout>
      <StackLayout direction="row">
        <LaunchStatusDialog />
      </StackLayout>
      <StackLayout direction="row">
        <FormFieldValidation />
        <StackLayout>
          <FormFieldHelperText />
          <FlexItem>
            <WithMultilineInputAsQuestion />
          </FlexItem>
        </StackLayout>
        <StackLayout>
          <FormFieldReadonly />
        </StackLayout>
      </StackLayout>
      <StackLayout>
        <ListBox selected={["blue"]}>
          <Option value="green">Green</Option>
          <Option disabled value="red">
            Red
          </Option>
          <Option value="blue">Blue</Option>
          <Option value="purple">Purple</Option>
        </ListBox>
      </StackLayout>
      <AgGridThemeDefault
        columnDefs={[
          {
            headerName: "Name",
            field: "name",
            filterParams: {
              buttons: ["reset", "apply"],
            },
            editable: false,
          },
          {
            headerName: "Code",
            field: "code",
          },
          {
            headerName: "Capital",
            field: "capital",
          },
          {
            headerName: "Action",
            cellRenderer: GriActionCellRenderer,
          },
        ]}
      />
      <H3>Zebra</H3>
      <AgGridThemeZebra />
      <H3>HD Compact</H3>
      <AgGridThemeHDCompact
        columnDefs={[
          {
            headerName: "Name",
            field: "name",
            filterParams: {
              buttons: ["reset", "apply"],
            },
            editable: false,
          },
          {
            headerName: "Code",
            field: "code",
          },
          {
            headerName: "Capital",
            field: "capital",
          },
          {
            headerName: "Action",
            cellRenderer: GriActionCellRenderer,
          },
        ]}
      />
    </StackLayout>
  );
};

export const FormStatusAlignment = () => {
  return (
    <StackLayout gap={1}>
      <Input defaultValue="Input" validationStatus="error" />
      <MultilineInput defaultValue="MultilineInput" validationStatus="error" />
      <ComboBox value="Combo Box without Option" validationStatus="error" />
      <ComboBox defaultValue="Combo Box with Option" validationStatus="error">
        <Option value="1" />
      </ComboBox>
      <Dropdown value="Dropdown without Option" validationStatus="error" />
      <Dropdown value="Dropdown with Option" validationStatus="error">
        <Option value="1" />
      </Dropdown>
      <DatePicker selectionVariant="single">
        <DatePickerTrigger>
          <DatePickerSingleInput
            defaultValue="bad date"
            validationStatus="error"
          />
        </DatePickerTrigger>
      </DatePicker>
      <NumberInput defaultValue={0} validationStatus="error" />
    </StackLayout>
  );
};
