import {
  BorderItem,
  BorderLayout,
  Button,
  Card,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  Link,
  NavigationItem,
  StackLayout,
  Table,
  TableContainer,
  TBody,
  TD,
  Text,
  TH,
  THead,
  ToggleButton,
  ToggleButtonGroup,
  TR,
  useId,
} from "@salt-ds/core";
import {
  ArrowRightIcon,
  CloseIcon,
  DoubleChevronRightIcon,
  GithubIcon,
  GuideClosedIcon,
  HelpCircleIcon,
  MapIcon,
  StackoverflowIcon,
  TextUnorderedListIcon,
} from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelCloseTrigger,
  SidePanelGroup,
  type SidePanelGroupProps,
  type SidePanelProps,
  SidePanelTrigger,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import Article1 from "./images/article1.png";
import Article2 from "./images/article2.png";
import CardImg from "./images/card.png";
import PhoneImg from "./images/mobile.png";

export default {
  title: "Lab/Side Panel",
  component: SidePanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SidePanel>;

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const Default: StoryFn<SidePanelGroupProps> = (args) => {
  const headingId = useId();

  return (
    <SidePanelGroup {...args}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Open Default Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel aria-labelledby={headingId}>
          <StackLayout align="start" gap={1}>
            <SidePanelCloseTrigger>
              <Button
                aria-label="Close"
                appearance="transparent"
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelCloseTrigger>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};

export const Left: StoryFn<SidePanelGroupProps> = (args) => {
  const headingId = useId();

  return (
    <SidePanelGroup {...args}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <SidePanel aria-labelledby={headingId} position="left">
          <StackLayout align="start" gap={1}>
            <SidePanelCloseTrigger>
              <Button
                aria-label="Close"
                appearance="transparent"
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelCloseTrigger>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
        <FlexItem padding={1}>
          <SidePanelTrigger>
            <Button>Open Left Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
      </FlexLayout>
    </SidePanelGroup>
  );
};

export const Controlled: StoryFn<SidePanelGroupProps> = (args) => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup {...args} open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Open Right Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel position="right" aria-labelledby={headingId}>
          <StackLayout align="start" gap={1}>
            <SidePanelCloseTrigger onClick={() => setOpen(false)}>
              <Button
                aria-label="Close"
                appearance="transparent"
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelCloseTrigger>
            <H2 id={headingId}>Section Title</H2>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
            {Array.from({ length: 7 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};

export const ManualTrigger: StoryFn<SidePanelProps> = (args) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <FlexItem padding={1} grow={1}>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open Manual Panel
        </Button>
      </FlexItem>
      <FlexItem>
        <SidePanel
          {...args}
          open={open}
          onOpenChange={setOpen}
          id={id}
          aria-labelledby={headingId}
        >
          <StackLayout align="start" gap={1}>
            <SidePanelCloseTrigger
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <Button aria-label="Close" appearance="transparent">
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelCloseTrigger>
            <H2 id={headingId}>Manual Trigger Link</H2>
            <Text>
              This example shows a trigger outside SidePanelGroup. The user
              manually provides aria-expanded and aria-controls.
            </Text>
          </StackLayout>
        </SidePanel>
      </FlexItem>
    </FlexLayout>
  );
};

export const Variants: StoryFn<SidePanelGroupProps> = (args) => {
  const primaryHeadingId = useId();
  const secondaryHeadingId = useId();
  const tertiaryHeadingId = useId();

  return (
    <StackLayout gap={2} style={{ padding: "16px" }}>
      <FlexLayout gap={1}>
        <SidePanelGroup {...args}>
          <SidePanelTrigger>
            <Button>Toggle Primary Panel</Button>
          </SidePanelTrigger>
          <SidePanel variant="primary" aria-labelledby={primaryHeadingId}>
            <StackLayout align="start" gap={1}>
              <SidePanelCloseTrigger>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  style={{ marginLeft: "auto" }}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </SidePanelCloseTrigger>
              <H2 id={primaryHeadingId}>Primary Variant</H2>
              <Text>
                This panel uses the primary variant, which is the default
                background color for containers.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
        <SidePanelGroup>
          <SidePanelTrigger>
            <Button>Toggle Secondary Panel</Button>
          </SidePanelTrigger>
          <SidePanel variant="secondary" aria-labelledby={secondaryHeadingId}>
            <StackLayout align="start" gap={1}>
              <SidePanelCloseTrigger>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  style={{ marginLeft: "auto" }}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </SidePanelCloseTrigger>
              <H2 id={secondaryHeadingId}>Secondary Variant</H2>
              <Text>
                This panel uses the secondary variant with a different
                background color.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
        <SidePanelGroup>
          <SidePanelTrigger>
            <Button>Toggle Tertiary Panel</Button>
          </SidePanelTrigger>
          <SidePanel variant="tertiary" aria-labelledby={tertiaryHeadingId}>
            <StackLayout align="start" gap={1}>
              <SidePanelCloseTrigger>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  style={{ marginLeft: "auto" }}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </SidePanelCloseTrigger>
              <H2 id={tertiaryHeadingId}>Tertiary Variant</H2>
              <Text>
                This panel uses the tertiary variant with yet another background
                color.
              </Text>
              <FormFieldExample />
              <FormFieldExample />
            </StackLayout>
          </SidePanel>
        </SidePanelGroup>
      </FlexLayout>
    </StackLayout>
  );
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

const tableData: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    department: "Engineering",
    status: "Active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    department: "Design",
    status: "Active",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    department: "Product",
    status: "On Leave",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david.brown@example.com",
    department: "Sales",
    status: "Active",
  },
  {
    id: "5",
    name: "Eve Martinez",
    email: "eve.martinez@example.com",
    department: "Engineering",
    status: "Active",
  },
];

export const WithTable: StoryFn<SidePanelGroupProps> = (args) => {
  const [selectedRow, setSelectedRow] = useState<TeamMember | null>(null);
  const panelHeadingId = useId();

  const handleRowClick = (row: TeamMember) => {
    setSelectedRow(row);
  };

  return (
    <SidePanelGroup {...args}>
      <FlexLayout
        style={{
          height: "100vh",
        }}
        gap={0}
      >
        <div
          style={{
            flex: 1,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TableContainer>
            <Table>
              <caption>Team members</caption>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Department</TH>
                  <TH>Status</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {tableData.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.name}</TD>
                    <TD>{row.email}</TD>
                    <TD>{row.department}</TD>
                    <TD>{row.status}</TD>
                    <TD>
                      <SidePanelTrigger>
                        <Button
                          onClick={() => handleRowClick(row)}
                          style={{ minWidth: "auto" }}
                        >
                          View Details
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
            <SidePanelCloseTrigger>
              <Button
                aria-label="Close"
                appearance="transparent"
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
            </SidePanelCloseTrigger>
            {selectedRow && (
              <>
                <H2 id={panelHeadingId}>Employee Details</H2>
                <StackLayout gap={2}>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Name</Text>
                    <Text>{selectedRow.name}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Email</Text>
                    <Text>{selectedRow.email}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Department</Text>
                    <Text>{selectedRow.department}</Text>
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600 }}>Status</Text>
                    <Text>{selectedRow.status}</Text>
                  </div>
                  <Button>Edit Details</Button>
                </StackLayout>
              </>
            )}
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};

const DesktopAppHeader = ({ items }: { items?: string[] }) => {
  const [active, setActive] = useState(items?.[0]);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const setScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", setScroll);
    return () => {
      window.removeEventListener("scroll", setScroll);
    };
  }, []);

  return (
    <header>
      <FlexLayout
        style={{
          paddingLeft: "var(--salt-spacing-300)",
          paddingRight: "var(--salt-spacing-300)",
          backgroundColor: "var(--salt-container-primary-background)",
          position: "fixed",
          width: "100%",
          zIndex: 1,
          boxShadow:
            offset > 0 ? "var(--salt-overlayable-shadow-scroll)" : "none",
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <Text styleAs="h2">Logo</Text>
        </FlexItem>
        <nav>
          <ul
            style={{
              display: "flex",
              listStyle: "none",
              padding: "0",
              margin: "0",
            }}
          >
            {items?.map((item) => (
              <li key={item}>
                <NavigationItem
                  active={active === item}
                  href="#"
                  onClick={() => setActive(item)}
                >
                  {item}
                </NavigationItem>
              </li>
            ))}
          </ul>
        </nav>
        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <SidePanelTrigger>
              <Button appearance="transparent">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
            <Button appearance="transparent">
              <StackoverflowIcon aria-hidden />
            </Button>
            <Button appearance="transparent">
              <GithubIcon aria-hidden />
            </Button>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

export const WithAppHeader: StoryFn<SidePanelGroupProps> = (args) => {
  const items = ["Home", "About", "Services", "Contact", "Blog"];
  const headingId = useId();

  return (
    <SidePanelGroup {...args}>
      <BorderLayout>
        <BorderItem position="north">
          <DesktopAppHeader items={items} />
        </BorderItem>
        <BorderItem
          style={{
            marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          }}
          position="center"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
              key={index}
              style={{
                padding: "var(--salt-spacing-400)",
                margin: "var(--salt-spacing-400)",
                backgroundColor: "var(--salt-container-secondary-background)",
              }}
            />
          ))}
        </BorderItem>
        <BorderItem
          style={{
            marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          }}
          position="east"
        >
          <SidePanel aria-labelledby={headingId}>
            <StackLayout>
              <FlexLayout align="center">
                <Text styleAs="h2" id={headingId}>
                  Help and support
                </Text>
                <SidePanelCloseTrigger>
                  <Button
                    aria-label="Close"
                    appearance="transparent"
                    style={{ marginLeft: "auto" }}
                  >
                    <DoubleChevronRightIcon aria-hidden />
                  </Button>
                </SidePanelCloseTrigger>
              </FlexLayout>
              <ToggleButtonGroup defaultValue="0">
                <ToggleButton value="0">toggle</ToggleButton>
                <ToggleButton value="1">toggle</ToggleButton>
                <ToggleButton value="2">toggle</ToggleButton>
              </ToggleButtonGroup>
              {/* Header */}
              {/* Content */}
              <StackLayout>
                <StackLayout gap={2}>
                  <FlexLayout gap={1} align="center">
                    <TextUnorderedListIcon aria-hidden />
                    <Text styleAs="h3">FAQs</Text>
                  </FlexLayout>
                  <StackLayout gap={2}>
                    <Link href="#">FAQ article title/questions</Link>
                    <Link href="#">FAQ article title/questions</Link>
                    <Link href="#">FAQ article title/questions</Link>
                  </StackLayout>
                </StackLayout>

                <FlexItem align="end">
                  <Button appearance="transparent">
                    VIEW MORE <ArrowRightIcon aria-hidden />
                  </Button>
                </FlexItem>
                <Divider />

                <StackLayout gap={2}>
                  <FlexLayout gap={1} align="center">
                    <GuideClosedIcon aria-hidden />
                    <Text styleAs="h3">Terms</Text>
                  </FlexLayout>
                  <StackLayout gap={2}>
                    <Link href="#">Terms title</Link>
                    <Text>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Consequatur culpa enim.
                    </Text>
                    <Link href="#">Terms title</Link>
                    <Text>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Consequatur culpa enim.
                    </Text>
                    <Link href="#">Terms title</Link>
                    <Text>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Consequatur culpa enim.
                    </Text>
                  </StackLayout>
                </StackLayout>

                <FlexItem align="end">
                  <Button appearance="transparent">
                    VIEW MORE <ArrowRightIcon aria-hidden />
                  </Button>
                </FlexItem>

                <Divider />

                <StackLayout gap={2}>
                  <FlexLayout gap={1} align="center">
                    <MapIcon aria-hidden />
                    <Text styleAs="h3">Tours</Text>
                  </FlexLayout>

                  <Card>
                    <StackLayout gap={1}>
                      <FlexLayout gap={1}>
                        <img
                          src={PhoneImg}
                          alt="phone"
                          height={72}
                          width={72}
                        />
                        <FlexItem>
                          <Text>Title</Text>
                          <Text color="secondary">
                            Lorem ipsum dolor sit amet, consectetuer adipiscing
                            elit. In in nunc.
                          </Text>
                        </FlexItem>
                      </FlexLayout>
                    </StackLayout>
                  </Card>
                  <Card>
                    <StackLayout gap={1}>
                      <FlexLayout gap={1}>
                        <img src={CardImg} alt="card" height={72} width={72} />
                        <FlexItem>
                          <Text>Title</Text>
                          <Text color="secondary">
                            Lorem ipsum dolor sit amet, consectetuer adipiscing
                            elit. In in nunc.
                          </Text>
                        </FlexItem>
                      </FlexLayout>
                    </StackLayout>
                  </Card>

                  <FlexItem align="end">
                    <Button appearance="transparent">
                      VIEW MORE <ArrowRightIcon aria-hidden />
                    </Button>
                  </FlexItem>
                </StackLayout>

                <Divider />

                <StackLayout gap={2}>
                  <FlexLayout gap={1} align="center">
                    <TextUnorderedListIcon aria-hidden />
                    <Text styleAs="h3">Articles</Text>
                  </FlexLayout>
                  <Card>
                    <img
                      src={Article1}
                      alt="article"
                      height={72}
                      style={{
                        borderRadius: "var(--salt-palette-corner-weak)",
                      }}
                    />
                    <Link href="#">Article title</Link>
                    <Text color="secondary">
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                      In in nunc.
                    </Text>
                  </Card>
                  <Card>
                    <img
                      src={Article2}
                      alt="article"
                      height={72}
                      style={{
                        borderRadius: "var(--salt-palette-corner-weak)",
                      }}
                    />
                    <Link href="#">Article title</Link>
                    <Text color="secondary">
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                      In in nunc.
                    </Text>
                  </Card>
                </StackLayout>
              </StackLayout>
            </StackLayout>
          </SidePanel>
        </BorderItem>
        <BorderItem position="south">
          <div
            style={{
              padding: "var(--salt-spacing-200)",
              margin: "var(--salt-spacing-200)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          >
            <Text>Footer</Text>
          </div>
        </BorderItem>
      </BorderLayout>
    </SidePanelGroup>
  );
};
