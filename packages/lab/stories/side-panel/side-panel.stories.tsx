import {
  BorderItem,
  BorderLayout,
  Button,
  Card,
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
  Tooltip,
  TR,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  ChattingIcon,
  DoubleChevronRightIcon,
  HelpCircleIcon,
  NotificationIcon,
  SearchIcon,
} from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "@salt-ds/react-resizable-panels-theme/index.css";
import React, {
  type ChangeEventHandler,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

export default {
  title: "Lab/Side Panel",
  component: SidePanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SidePanel>;

const ContentExample = ({ children }: { children?: ReactNode }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-200)",
      padding: "var(--salt-spacing-300)",
      overflow: "auto",
    }}
  >
    {children}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--salt-spacing-200)",
        flex: 1,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
          key={`content-${i}`}
          style={{
            backgroundColor: "var(--salt-container-secondary-background)",
            borderRadius: "var(--salt-palette-corner-weak)",
            border:
              "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 80,
          }}
        />
      ))}
    </div>
  </div>
);

export const Default: StoryFn = () => {
  return (
    <SidePanelProvider>
      <DefaultContent />
    </SidePanelProvider>
  );
};

const DefaultContent = () => {
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <FlexLayout
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} right panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>

      <SidePanel position="right">
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </FlexLayout>
  );
};

export const Left: StoryFn = () => {
  return (
    <SidePanelProvider>
      <LeftContent />
    </SidePanelProvider>
  );
};

const LeftContent = () => {
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <FlexLayout
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <SidePanel position="left">
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>

      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} left panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>
    </FlexLayout>
  );
};

// ---------------------------------------------------------------------------
// ManualTrigger (left + right panels with independent providers)
// ---------------------------------------------------------------------------

const manualPanelStyle = {
  "--saltSidePanel-width": "200px",
} as CSSProperties;

type ManualPanelContext = ReturnType<typeof useSidePanelContext>;

const ManualRightPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel style={manualPanelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Right Panel</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Right panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const ManualLeftPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel position="left" style={manualPanelStyle} variant="secondary">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Left Panel</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Left panel content.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const ManualTriggerButton = ({
  children,
  context,
}: {
  children: string;
  context: ManualPanelContext;
}) => {
  const { openState, setOpen, getReferenceProps, setReference, panelId } =
    context;

  return (
    <Button
      {...(getReferenceProps({
        "aria-expanded": openState,
        "aria-controls": openState ? panelId : undefined,
        onClick: () => setOpen(!openState),
      }) as Record<string, unknown>)}
      ref={setReference as React.Ref<HTMLButtonElement>}
      style={{ width: "fit-content", whiteSpace: "nowrap" }}
    >
      {children}
    </Button>
  );
};

const ManualRightPanelTriggerButton = () => {
  const rightPanelContext = useSidePanelContext();

  return (
    <ManualTriggerButton context={rightPanelContext}>
      Toggle right panel
    </ManualTriggerButton>
  );
};

const ManualContentArea = () => {
  const leftPanelContext = useSidePanelContext();

  return (
    <SidePanelProvider>
      <ContentExample>
        <Text style={{ marginBottom: "var(--salt-spacing-100)" }}>
          Each side panel needs its own provider context. The left panel uses
          the outer provider, and the right panel uses this nested provider.
        </Text>
        <FlexLayout gap={1} justify="space-between">
          <ManualTriggerButton context={leftPanelContext}>
            Toggle left panel
          </ManualTriggerButton>
          <ManualRightPanelTriggerButton />
        </FlexLayout>
      </ContentExample>
      <ManualRightPanel />
    </SidePanelProvider>
  );
};

export const ManualTrigger: StoryFn = () => (
  <div
    style={{
      width: "100%",
      height: 300,
      display: "flex",
      border:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      borderRadius: "var(--salt-palette-corner-weak)",
      overflow: "hidden",
    }}
  >
    <SidePanelProvider>
      <ManualLeftPanel />
      <ManualContentArea />
    </SidePanelProvider>
  </div>
);

const variantOptions = ["primary", "secondary", "tertiary", "none"];

export const Variants: StoryFn = () => {
  return (
    <SidePanelProvider defaultOpen={true}>
      <VariantsContent />
    </SidePanelProvider>
  );
};

const VariantsContent = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
    <FlexLayout
      style={{
        width: "100%",
        height: 320,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <ContentExample>
        <StackLayout direction="column" gap={1}>
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
      </ContentExample>

      <SidePanel position="right" variant={variant}>
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </FlexLayout>
  );
};

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

const withTablePanelStyle = {
  "--saltSidePanel-width": "250px",
} as CSSProperties;

export const WithTable: StoryFn = () => {
  return (
    <SidePanelProvider>
      <WithTableContent />
    </SidePanelProvider>
  );
};

const WithTableContent = () => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const { CloseIcon } = useIcon();
  const { setOpen, setReference, getReferenceProps, openState, panelId } =
    useSidePanelContext();

  const handleRowClick = (row: TeamMember, target: HTMLElement) => {
    setSelectedRow(row);
    setReference(target);
    setOpen(true);
  };

  const getTriggerProps = (row: TeamMember) => {
    const isExpanded = openState && selectedRow?.id === row.id;

    return getReferenceProps({
      "aria-expanded": isExpanded,
      "aria-controls": isExpanded ? panelId : undefined,
      "aria-label": `Edit details for ${row.name}`,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleRowClick(row, e.currentTarget);
      },
    }) as Record<string, unknown>;
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
                <TH>Phone</TH>
                <TH>Action</TH>
              </TR>
            </THead>
            <TBody>
              {tableData.map((row) => (
                <TR key={row.id}>
                  <TD>{row.name}</TD>
                  <TD>{row.email}</TD>
                  <TD>{row.phone}</TD>
                  <TD>
                    <Button
                      {...getTriggerProps(row)}
                      style={{ minWidth: "auto" }}
                    >
                      Edit
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <SidePanel
        position="right"
        style={withTablePanelStyle}
        key={selectedRow?.id}
      >
        {selectedRow && (
          <>
            <SidePanelHeader>
              <SidePanelTitle>
                <H2>
                  <span className="salt-visuallyHidden">
                    {selectedRow.name}
                  </span>
                  Employee Details
                </H2>
              </SidePanelTitle>
              <Button
                aria-label="Close"
                appearance="transparent"
                onClick={() => setOpen(false)}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelHeader>
            <SidePanelContent>
              <StackLayout style={{ width: "100%" }}>
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
            </SidePanelContent>
          </>
        )}
      </SidePanel>
    </FlexLayout>
  );
};

const DesktopAppHeader = () => {
  const { openState } = useSidePanelContext();
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
            <Tooltip content="Toggle help panel" hideArrow>
              <SidePanelTrigger>
                <Button
                  appearance="transparent"
                  aria-label={
                    openState ? "Close help panel" : "Open help panel"
                  }
                >
                  <HelpCircleIcon aria-hidden />
                </Button>
              </SidePanelTrigger>
            </Tooltip>
            <Tooltip content="Show notifications" hideArrow>
              <Button
                appearance="transparent"
                aria-label={"open notifications"}
              >
                <NotificationIcon aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Open chat" hideArrow>
              <Button appearance="transparent" aria-label={"open chat"}>
                <ChattingIcon aria-hidden />
              </Button>
            </Tooltip>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

const WithAppHeaderPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel>
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Help &amp; support</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>
          The content shown here is for illustrative purposes and does not
          contain specific information or advice. Using placeholder text like
          this helps review formatting, spacing, and overall presentation in the
          user interface. Adjust the wording as needed to suit your particular
          requirements or design preferences.
        </Text>
      </SidePanelContent>
    </SidePanel>
  );
};

export const WithAppHeader: StoryFn = () => {
  return (
    <SidePanelProvider defaultOpen={true}>
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
          <ContentExample />
        </BorderItem>
        <BorderItem position="east">
          <WithAppHeaderPanel />
        </BorderItem>
      </BorderLayout>
    </SidePanelProvider>
  );
};

const OUTER_PANEL_WIDTH = 500;
const INNER_PANEL_WIDTH = 200;

const outerPanelStyle = {
  "--saltSidePanel-width": `${OUTER_PANEL_WIDTH}px`,
} as CSSProperties;

const innerPanelStyle = {
  "--saltSidePanel-width": `${INNER_PANEL_WIDTH}px`,
} as CSSProperties;

const InnerPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel style={innerPanelStyle} variant="tertiary">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Nested Panel</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>This panel is nested inside the right panel.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

const OuterPanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  const headingId = useId();

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
              <Text>Content of the right panel.</Text>
              <SidePanelTrigger>
                <Button style={{ width: "fit-content" }}>
                  Toggle nested panel
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

export const Nested: StoryFn = () => (
  <div
    style={{
      width: "100%",
      height: 300,
      display: "flex",
      border:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      borderRadius: "var(--salt-palette-corner-weak)",
      overflow: "hidden",
    }}
  >
    <SidePanelProvider>
      <ContentExample>
        <FlexLayout justify="end">
          <SidePanelTrigger>
            <Button style={{ width: "fit-content", whiteSpace: "nowrap" }}>
              Toggle right panel
            </Button>
          </SidePanelTrigger>
        </FlexLayout>
      </ContentExample>
      <OuterPanel />
    </SidePanelProvider>
  </div>
);

// ---------------------------------------------------------------------------
// Scrollable
// ---------------------------------------------------------------------------

const ScrollableContent = () => (
  <div
    role="region"
    aria-label="Main content"
    tabIndex={0}
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-200)",
      padding: "var(--salt-spacing-300)",
      overscrollBehavior: "contain",
      overflow: "auto",
    }}
  >
    <SidePanelTrigger>
      <Button style={{ width: "fit-content", flexShrink: 0 }}>
        Toggle right panel
      </Button>
    </SidePanelTrigger>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--salt-spacing-200)",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`grid-item-${
            // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
            i
          }`}
          style={{
            backgroundColor: "var(--salt-container-secondary-background)",
            borderRadius: "var(--salt-palette-corner-weak)",
            border:
              "var(--salt-size-fixed-100) dashed var(--salt-container-primary-borderColor)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 80,
          }}
        />
      ))}
    </div>
  </div>
);

const ScrollablePanel = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel position="right">
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Section Title</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <StackLayout>
          {Array.from({ length: 10 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
            <Text key={`content-${i}`}>
              Panel item — This is scrollable content inside the side panel that
              demonstrates independent scrolling.
            </Text>
          ))}
        </StackLayout>
      </SidePanelContent>
    </SidePanel>
  );
};

export const Scrollable: StoryFn = () => {
  return (
    <SidePanelProvider>
      <FlexLayout
        style={{
          width: "100%",
          height: 300,
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
        gap={0}
      >
        <ScrollableContent />
        <ScrollablePanel />
      </FlexLayout>
    </SidePanelProvider>
  );
};

/** State, refs, toggle logic and CSS transition for animating a
 *  react-resizable-panels Panel as a SidePanel. */
function useResizableSidePanel({
  defaultExpanded = false,
  expandedSize = 25,
}: {
  defaultExpanded?: boolean;
  expandedSize?: number;
} = {}) {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const toggle = useCallback(() => {
    if (!panelRef.current) return;
    clearTimeout(timerRef.current);
    const willExpand = !expanded;
    const duration =
      Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--salt-duration-perceptible",
        ),
        10,
      ) || 300; // var(--salt-duration-perceptible)
    setAnimating(true);
    setExpanded(willExpand);
    requestAnimationFrame(() => {
      panelRef.current?.resize(willExpand ? expandedSize : 0);
    });
    timerRef.current = setTimeout(() => setAnimating(false), duration);
  }, [expanded, expandedSize]);

  const panelTransition = animating
    ? "flex-grow var(--salt-duration-perceptible) var(--salt-animation-timing-function)"
    : undefined;

  const handleOpenChange = useCallback((_open: boolean) => toggle(), [toggle]);

  return {
    panelRef,
    expanded,
    animating,
    toggle,
    panelTransition,
    handleOpenChange,
  };
}

/** Style overrides for a SidePanel inside a resizable Panel (the Panel itself
 *  controls width so the SidePanel's own width and border are disabled). */
const resizableSidePanelStyle = {
  "--saltSidePanel-width": "100%",
} as CSSProperties;

const ResizablePanel = ({ style }: { style?: CSSProperties }) => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel
      disableAnimation
      style={{ ...resizableSidePanelStyle, ...style }}
      variant="primary"
    >
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Section Title</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent style={{ minWidth: 300 }}>
        <Text>Side panel content goes here.</Text>
      </SidePanelContent>
    </SidePanel>
  );
};

export const Resizable: StoryFn = () => {
  const { panelRef, expanded, animating, panelTransition, handleOpenChange } =
    useResizableSidePanel({ expandedSize: 30 });

  return (
    <SidePanelProvider open={expanded} onOpenChange={handleOpenChange}>
      <div
        className="react-resizable-panels-theme-salt"
        style={{
          width: "100%",
          height: 300,
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
          borderRadius: "var(--salt-palette-corner-weak)",
          overflow: "hidden",
        }}
      >
        <PanelGroup direction="horizontal">
          <Panel style={{ transition: panelTransition }}>
            <ContentExample>
              <SidePanelTrigger>
                <Button style={{ width: "fit-content" }}>
                  {expanded ? "Close" : "Open"} right panel
                </Button>
              </SidePanelTrigger>
            </ContentExample>
          </Panel>
          <PanelResizeHandle
            aria-label="Resize panel"
            className="resize-handle-salt-border-left"
            disabled={animating || !expanded}
            style={{
              width: expanded || animating ? undefined : 0,
              visibility: expanded || animating ? "visible" : "hidden",
            }}
          />
          <Panel
            ref={panelRef}
            defaultSize={0}
            minSize={expanded && !animating ? 15 : 0}
            maxSize={expanded || animating ? 50 : 0}
            style={{ overflow: "hidden", transition: panelTransition }}
          >
            <ResizablePanel />
          </Panel>
        </PanelGroup>
      </div>
    </SidePanelProvider>
  );
};

const Nav = () => (
  <nav
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-100)",
      padding: "var(--salt-spacing-200)",
      borderRight:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
      backgroundColor: "var(--salt-container-secondary-background)",
      whiteSpace: "nowrap",
    }}
  >
    <Text styleAs="label" style={{ fontWeight: "bold" }}>
      Nav
    </Text>
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </nav>
);

export const WithNav: StoryFn = () => {
  return (
    <SidePanelProvider>
      <WithNavContent />
    </SidePanelProvider>
  );
};

const WithNavContent = () => {
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <FlexLayout
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <Nav />
      <SidePanel position="left">
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
      <ContentExample>
        <SidePanelTrigger>
          <Button style={{ width: "fit-content" }}>
            {openState ? "Close" : "Open"} side panel
          </Button>
        </SidePanelTrigger>
      </ContentExample>
    </FlexLayout>
  );
};

const CardsAppHeader = () => {
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
            <Tooltip content="Toggle help panel" hideArrow>
              <SidePanelTrigger>
                <Button appearance="transparent" aria-label="open help panel">
                  <HelpCircleIcon aria-hidden />
                </Button>
              </SidePanelTrigger>
            </Tooltip>
            <Tooltip content="Show notifications" hideArrow>
              <Button appearance="transparent" aria-label="open notifications">
                <NotificationIcon aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Open chat" hideArrow>
              <Button appearance="transparent" aria-label="open chat">
                <ChattingIcon aria-hidden />
              </Button>
            </Tooltip>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

const HelpPanelCard = ({
  headingId,
  open,
  onToggle,
  style,
}: {
  headingId: string | undefined;
  open: boolean;
  onToggle: () => void;
  style?: CSSProperties;
}) => (
  <Card
    variant="tertiary"
    style={{
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...style,
    }}
  >
    <FlexLayout align="center" gap={1}>
      <Button
        appearance="transparent"
        aria-label={open ? "Close panel" : "Open panel"}
        onClick={onToggle}
      >
        <DoubleChevronRightIcon aria-hidden />
      </Button>
      <H2 id={headingId} style={{ flex: 1 }}>
        Help &amp; support
      </H2>
    </FlexLayout>
    <FlexItem
      role="region"
      aria-label="Help and support content"
      tabIndex={0}
      grow={1}
      style={{
        overflow: "auto",
        overscrollBehavior: "contain",
        paddingTop: "var(--salt-spacing-100)",
        marginRight: "calc(-1 * var(--salt-spacing-200))",
        paddingRight: "var(--salt-spacing-200)",
      }}
    >
      <StackLayout gap={2}>
        {Array.from({ length: 15 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Example-only static placeholder items
          <Text key={`panel-item-${i}`}>
            Panel item {i + 1} — The content shown here is for illustrative
            purposes and does not contain specific information or advice.
          </Text>
        ))}
      </StackLayout>
    </FlexItem>
  </Card>
);

const CardsContent = () => {
  const headingId = useId();
  const { openState, setOpen } = useSidePanelContext();

  return (
    <FlexLayout
      direction="column"
      style={{
        width: "100%",
        height: "100vh",
      }}
      gap={0}
    >
      <CardsAppHeader />

      <FlexLayout
        gap={2}
        padding={2}
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        <FlexItem grow={1}>
          <StackLayout gap={2}>
            {Array.from({ length: 20 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Example-only static placeholder items
              <Card key={`content-card-${i}`}>
                <Text>
                  Content card {i + 1} — This card is part of the main
                  scrollable content area. It demonstrates how content can
                  overflow and scroll independently within the layout.
                </Text>
              </Card>
            ))}
          </StackLayout>
        </FlexItem>

        <SidePanel
          aria-labelledby={headingId}
          style={
            {
              position: "sticky",
              top: 0,
              alignSelf: "flex-start",
              maxHeight: "100%",
            } as CSSProperties
          }
          variant="none"
        >
          <HelpPanelCard
            headingId={headingId}
            open={openState}
            onToggle={() => setOpen(!openState)}
            style={{ flex: 1 }}
          />
        </SidePanel>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Cards: StoryFn = () => {
  return (
    <SidePanelProvider defaultOpen={true}>
      <CardsContent />
    </SidePanelProvider>
  );
};

export const ResizableCards: StoryFn = () => {
  const {
    panelRef,
    expanded,
    animating,
    toggle,
    panelTransition,
    handleOpenChange,
  } = useResizableSidePanel({ defaultExpanded: true });

  const headingId = useId();

  return (
    <FlexLayout
      direction="column"
      style={{ width: "100%", height: "100vh" }}
      gap={0}
    >
      <SidePanelProvider open={expanded} onOpenChange={handleOpenChange}>
        <CardsAppHeader />

        <div
          className="react-resizable-panels-theme-salt"
          style={{ flex: 1, overflow: "hidden" }}
        >
          <PanelGroup direction="horizontal">
            <Panel
              tabIndex={0}
              role="region"
              aria-label="Main content"
              style={{
                overflow: "auto",
                padding: "var(--salt-spacing-200)",
                transition: panelTransition,
              }}
            >
              <StackLayout gap={2}>
                {Array.from({ length: 20 }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Example-only static placeholder items
                  <Card key={`content-card-${i}`}>
                    <Text>
                      Content card {i + 1} — This card is part of the main
                      scrollable content area.
                    </Text>
                  </Card>
                ))}
              </StackLayout>
            </Panel>

            <PanelResizeHandle
              aria-label="Resize side panel"
              className="resize-handle-salt-border-left"
              disabled={animating || !expanded}
              style={{
                width: expanded || animating ? undefined : 0,
                visibility: expanded || animating ? "visible" : "hidden",
              }}
            />

            <Panel
              ref={panelRef}
              defaultSize={25}
              minSize={expanded && !animating ? 15 : 0}
              maxSize={expanded || animating ? 50 : 0}
              style={{
                overflow: "hidden",
                transition: panelTransition,
                padding: "var(--salt-spacing-100)",
              }}
            >
              <SidePanel
                disableAnimation
                aria-labelledby={headingId}
                style={resizableSidePanelStyle}
                variant="none"
              >
                <HelpPanelCard
                  headingId={headingId}
                  open={expanded}
                  onToggle={toggle}
                  style={{
                    height: "100%",
                    boxSizing: "border-box",
                    minWidth: 300,
                  }}
                />
              </SidePanel>
            </Panel>
          </PanelGroup>
        </div>
      </SidePanelProvider>
    </FlexLayout>
  );
};
