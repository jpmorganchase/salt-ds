import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H2,
  Input,
  Link,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Table,
  TableContainer,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  ChattingIcon,
  HelpCircleIcon,
  NotificationIcon,
  SearchIcon,
} from "@salt-ds/icons";
import {
  SidePanel,
  type SidePanelGroupProps,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEventHandler, type CSSProperties, useState } from "react";

export default {
  title: "Lab/Side Panel",
  component: SidePanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SidePanel>;

// ---------------------------------------------------------------------------
// Default (Right Panel)
// ---------------------------------------------------------------------------

const DefaultPanelContent = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();
  return (
    <>
      <div style={{ flex: 1, padding: "var(--salt-spacing-300)" }}>
        <SidePanelTrigger>
          <Button>{openState ? "Close" : "Open"} right panel</Button>
        </SidePanelTrigger>
      </div>

      <SidePanel position="right" aria-labelledby={headingId}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>
    </>
  );
};

export const Default: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <FlexLayout
        style={{
          height: "100vh",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
        gap={0}
      >
        <DefaultPanelContent />
      </FlexLayout>
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// Left
// ---------------------------------------------------------------------------

const LeftPanelContent = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <>
      <SidePanel position="left" aria-labelledby={headingId}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          padding: "var(--salt-spacing-300)",
        }}
      >
        <SidePanelTrigger>
          <Button>{openState ? "Close" : "Open"} left panel</Button>
        </SidePanelTrigger>
      </div>
    </>
  );
};

export const Left: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <FlexLayout
        style={{
          height: "100vh",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
        gap={0}
      >
        <LeftPanelContent />
      </FlexLayout>
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// Controlled
// ---------------------------------------------------------------------------

const ControlledPanelContent = () => {
  const { openState, setOpen } = useSidePanelContext();
  const headingId = useId();
  const { CloseIcon } = useIcon();
  return (
    <>
      <SidePanel position="left" aria-labelledby={headingId}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          padding: "var(--salt-spacing-300)",
        }}
      >
        <SidePanelTrigger>
          <Button>{openState ? "Close" : "Open"} side panel</Button>
        </SidePanelTrigger>
      </div>
    </>
  );
};

export const Controlled: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <FlexLayout
        style={{
          height: "100vh",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
        gap={0}
      >
        <ControlledPanelContent />
      </FlexLayout>
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// ManualTrigger (left + right panels with independent providers)
// ---------------------------------------------------------------------------

const manualPanelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

const ManualRightPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      aria-labelledby={headingId}
      style={manualPanelStyle}
      variant="secondary"
    >
      <StackLayout gap={1}>
        <FlexLayout align="center">
          <H2 id={headingId} style={{ flex: 1 }}>
            Right Panel
          </H2>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </FlexLayout>
        <Text>Right panel content.</Text>
      </StackLayout>
    </SidePanel>
  );
};

const ManualLeftPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      position="left"
      aria-labelledby={headingId}
      style={manualPanelStyle}
      variant="secondary"
    >
      <StackLayout gap={1}>
        <FlexLayout align="center">
          <H2 id={headingId} style={{ flex: 1 }}>
            Left Panel
          </H2>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </FlexLayout>
        <Text>Left panel content.</Text>
      </StackLayout>
    </SidePanel>
  );
};

export const ManualTrigger: StoryFn<SidePanelGroupProps> = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
        overflow: "hidden",
      }}
    >
      <SidePanelProvider>
        <ManualLeftPanel />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "var(--salt-spacing-200)",
          }}
        >
          <SidePanelTrigger>
            <Button style={{ whiteSpace: "nowrap" }}>Toggle left panel</Button>
          </SidePanelTrigger>
        </div>
      </SidePanelProvider>

      <SidePanelProvider>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "var(--salt-spacing-200)",
          }}
        >
          <SidePanelTrigger>
            <Button style={{ whiteSpace: "nowrap" }}>Toggle right panel</Button>
          </SidePanelTrigger>
        </div>
        <ManualRightPanel />
      </SidePanelProvider>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const variantOptions = ["primary", "secondary", "tertiary"];

const VariantsPanelContent = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
    <>
      <StackLayout
        direction="column"
        style={{ flex: 1, padding: "var(--salt-spacing-300)" }}
      >
        <SidePanelTrigger>
          <Button style={{ width: "fit-content", whiteSpace: "nowrap" }}>
            {openState ? "Close" : "Open"} right panel
          </Button>
        </SidePanelTrigger>
        <FormField>
          <FormFieldLabel>Variant</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            aria-label="Variant Controls"
            name="variant"
            onChange={handleVariantChange}
            value={variant}
          >
            {variantOptions.map((option) => (
              <RadioButton
                key={option}
                label={`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                value={option}
              />
            ))}
          </RadioButtonGroup>
        </FormField>
      </StackLayout>

      <SidePanel position="right" aria-labelledby={headingId} variant={variant}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>
    </>
  );
};

export const Variants: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <FlexLayout
        style={{
          height: "100vh",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
        gap={0}
      >
        <VariantsPanelContent />
      </FlexLayout>
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// WithTable
// ---------------------------------------------------------------------------

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const tableData: TeamMember[] = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 212 555 0101",
  },
  {
    id: "2",
    name: "Taylor Reed",
    email: "taylor.reed@example.com",
    phone: "+1 212 555 0102",
  },
  {
    id: "3",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    phone: "+1 212 555 0103",
  },
  {
    id: "4",
    name: "Casey Patel",
    email: "casey.patel@example.com",
    phone: "+1 212 555 0104",
  },
  {
    id: "5",
    name: "Riley Chen",
    email: "riley.chen@example.com",
    phone: "+1 212 555 0105",
  },
];

const WithTableContent = () => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const panelHeadingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  const handleRowClick = (row: TeamMember) => {
    setSelectedRow(row);
  };

  return (
    <FlexLayout
      style={{
        width: "100%",
        height: "100%",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
      }}
      gap={0}
    >
      <div style={{ flex: 1, minWidth: 0, padding: "var(--salt-spacing-300)" }}>
        <TableContainer>
          <Table>
            <caption>Users</caption>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Action</TH>
              </TR>
            </THead>
            <TBody>
              {tableData.map((row) => (
                <TR key={row.id}>
                  <TD>{row.name}</TD>
                  <TD>{row.email}</TD>
                  <TD>
                    <SidePanelTrigger>
                      <Button
                        onClick={() => handleRowClick(row)}
                        style={{ minWidth: "auto" }}
                        aria-label={`Edit details for ${row.name}`}
                      >
                        Edit
                      </Button>
                    </SidePanelTrigger>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <SidePanel position="right" aria-labelledby={panelHeadingId}>
        <StackLayout align="start" gap={3}>
          <Button
            style={{ marginLeft: "auto" }}
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
          {selectedRow && (
            <StackLayout style={{ width: "100%" }}>
              <H2 id={panelHeadingId}>Employee Details</H2>
              <FormField>
                <FormFieldLabel>Name</FormFieldLabel>
                <Input defaultValue={selectedRow.name} />
              </FormField>
              <FormField>
                <FormFieldLabel>Email</FormFieldLabel>
                <Input defaultValue={selectedRow.email} />
              </FormField>
              <FormField>
                <FormFieldLabel>Phone</FormFieldLabel>
                <Input defaultValue={selectedRow.phone} />
              </FormField>
              <FlexLayout gap={1}>
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  style={{ width: "100%" }}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  sentiment="accented"
                  style={{ width: "100%" }}
                  onClick={() => setOpen(false)}
                >
                  Save
                </Button>
              </FlexLayout>
            </StackLayout>
          )}
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};

export const WithTable: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <WithTableContent />
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// WithAppHeader
// ---------------------------------------------------------------------------

const DesktopAppHeader = () => {
  return (
    <header>
      <FlexLayout
        style={{
          padding: "var(--salt-spacing-100) var(--salt-spacing-300)",
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 1,
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <Text styleAs="h2">App name</Text>
        </FlexItem>
        <Input
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 200 }}
        />
        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <SidePanelTrigger>
              <Button appearance="transparent" aria-label="open help panel">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
            <Button appearance="transparent">
              <NotificationIcon aria-hidden />
            </Button>
            <Button appearance="transparent">
              <ChattingIcon aria-hidden />
            </Button>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

const WithAppHeaderContent = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  return (
    <BorderLayout
      style={{
        position: "relative",
        width: "100%",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
      }}
    >
      <BorderItem position="north">
        <DesktopAppHeader />
      </BorderItem>
      <BorderItem position="center">
        <FlexLayout padding={3}>
          <Link href="#">Link 1</Link>
          <Link href="#">Link 2</Link>
          <Link href="#">Link 3</Link>
        </FlexLayout>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
            key={index}
            style={{
              padding: "var(--salt-spacing-300)",
              margin: "var(--salt-spacing-200) var(--salt-spacing-300)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
      <BorderItem position="east">
        <SidePanel aria-labelledby={headingId}>
          <StackLayout align="start" gap={1}>
            <Button
              style={{ marginLeft: "auto" }}
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
            <H2 id={headingId}>Help &amp; support</H2>
            <Text>
              The content shown here is for illustrative purposes and does not
              contain specific information or advice. Using placeholder text
              like this helps review formatting, spacing, and overall
              presentation in the user interface. Adjust the wording as needed
              to suit your particular requirements or design preferences.
            </Text>
          </StackLayout>
        </SidePanel>
      </BorderItem>
    </BorderLayout>
  );
};

export const WithAppHeader: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <WithAppHeaderContent />
    </SidePanelProvider>
  );
};

// ---------------------------------------------------------------------------
// Nested
// ---------------------------------------------------------------------------

const OUTER_PANEL_WIDTH = 500;
const INNER_PANEL_WIDTH = 200;

const outerPanelStyle = {
  "--saltSidePanel-width": `${OUTER_PANEL_WIDTH}px`,
} as CSSProperties;

const innerPanelStyle = {
  "--saltSidePanel-width": `${INNER_PANEL_WIDTH}px`,
} as CSSProperties;

const InnerPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      aria-labelledby={headingId}
      style={innerPanelStyle}
      variant="tertiary"
    >
      <StackLayout gap={1}>
        <FlexLayout align="center">
          <H2 id={headingId} style={{ flex: 1 }}>
            Nested Panel
          </H2>
          <Button
            aria-label="Close nested"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </FlexLayout>
        <Text>This panel is nested inside the right panel.</Text>
      </StackLayout>
    </SidePanel>
  );
};

const OuterPanel = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();

  return (
    <SidePanel
      aria-labelledby={headingId}
      style={outerPanelStyle}
      variant="secondary"
    >
      <SidePanelProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "calc(100% + 2 * var(--salt-spacing-300))",
            margin: "calc(-1 * var(--salt-spacing-300))",
            marginLeft: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "auto",
              padding: "var(--salt-spacing-300)",
            }}
          >
            <StackLayout gap={1}>
              <FlexLayout align="center">
                <H2 id={headingId} style={{ flex: 1 }}>
                  Outer Panel
                </H2>
                <Button
                  aria-label="Close outer"
                  appearance="transparent"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </FlexLayout>
              <Text>Content of the outer panel.</Text>
              <SidePanelTrigger>
                <Button style={{ width: "fit-content" }}>
                  Toggle Nested Panel
                </Button>
              </SidePanelTrigger>
            </StackLayout>
          </div>
          <InnerPanel />
        </div>
      </SidePanelProvider>
    </SidePanel>
  );
};

export const Nested: StoryFn<SidePanelGroupProps> = (args) => {
  return (
    <SidePanelProvider {...args}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Toggle Outer Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <OuterPanel />
      </FlexLayout>
    </SidePanelProvider>
  );
};
