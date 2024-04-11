import {
  Badge,
  Button,
  Card,
  Display1,
  FlexItem,
  H1,
  H2,
  Link,
  StackLayout,
  StatusIndicator,
  Text,
  Tooltip,
  VALIDATION_NAMED_STATUS,
  ValidationStatus,
  RadioButton,
  RadioButtonGroup,
  H3,
  FlexLayout,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@salt-ds/core";
import { AD, GB, UN, US } from "@salt-ds/countries";
import {
  NotificationIcon,
  NotificationSolidIcon,
  SaltShakerIcon,
  SaltShakerSolidIcon,
} from "@salt-ds/icons";
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
import {
  Horizontal as ToggleButtonGroupHorizontal,
  HorizontalIconOnly as ToggleButtonGroupHorizontalIon,
  HorizontalTextOnly as ToggleButtonGroupHorizontalText,
} from "../../../core/stories/toggle-button-group/toggle-button-group.stories";
import { Default as CardDefault } from "../../../core/stories/card/card.stories";
import { Default as InteractableCardStory } from "../../../core/stories/interactable-card/interactable-card.stories";
import {
  HorizontalGroup as CheckboxHorizontalGroup,
  Error as CheckboxError,
  Readonly as CheckboxReadonly,
} from "../../../core/stories/checkbox/checkbox.stories";
import { Default as SwitchDefault } from "../../../core/stories/switch/switch.stories";
import { useState } from "react";
import {
  Default as ToastDefault,
  Error as ToastError,
  Warning as ToastWarning,
} from "../../../core/stories/toast/toast.stories";
import { WithValidation as FormFieldValidation } from "../../../core/stories/form-field/form-field.stories";
import {
  Default as PillDefault,
  Disabled as PillDisabled,
  Closable as PillClosable,
  Icon as PillIcon,
} from "../../../core/stories/pill/pill.stories";
import { Default as OverlayDefault } from "../../../core/stories/overlay/overlay.stories";
import AgGridThemeDefault from "../../../ag-grid-theme/stories/examples/Default";
import AgGridThemeHDCompact from "../../../ag-grid-theme/stories/examples/HDCompact";

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

export const Example1 = () => {
  return (
    <StackLayout>
      <StackLayout direction="row">
        <Card variant="primary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <H2>H2 Subheader</H2>
          <Text variant="primary">Primary body copy</Text>
          <Text variant="secondary">Secondary body copy</Text>
          <Link>Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="secondary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <H2>H2 Subheader</H2>
          <Text variant="primary">Primary body copy</Text>
          <Text variant="secondary">Secondary body copy</Text>
          <Link>Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="primary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <Card variant="secondary">
            <H2>H2 Subheader</H2>
            <Text variant="primary">Primary body copy</Text>
            <Text variant="secondary">Secondary body copy</Text>
          </Card>
          <Link>Default link text</Link>
          <Text>
            <code>Code example 123</code>
          </Text>
        </Card>
        <Card variant="secondary">
          <Display1>Masthead</Display1>
          <H1>H1 Header</H1>
          <Card variant="primary">
            <H2>H2 Subheader</H2>
            <Text variant="primary">Primary body copy</Text>
            <Text variant="secondary">Secondary body copy</Text>
          </Card>
          <Link>Default link text</Link>
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
        <Link>Link</Link>
        <Link variant="secondary">Link</Link>
        <Link target="_blank">Link</Link>
        <Link target="_blank" variant="secondary">
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
        <Button disabled>Submit</Button>
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
      <StackLayout direction="row" gap={20} style={{ marginBlock: 60 }}>
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
