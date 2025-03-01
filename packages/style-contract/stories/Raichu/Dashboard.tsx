import {
  Avatar,
  Badge,
  Button,
  Card,
  CompactPaginator,
  Display3,
  Divider,
  Dropdown,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
  H1,
  H2,
  H3,
  Label,
  Link,
  LinkProps,
  Option,
  Pagination,
  SplitLayout,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  AddIcon,
  ArrowRightIcon,
  BankIcon,
  BarChartIcon,
  CallIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DiamondIcon,
  FavoriteIcon,
  FlagIcon,
  GridIcon,
  InboxIcon,
  LineChartIcon,
  LinkedIcon,
  ListIcon,
  LockedIcon,
  MessageIcon,
  MicroMenuIcon,
  SendIcon,
  SuccessCircleIcon,
  SwapIcon,
  UserGroupIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  CSSProperties,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import buildingImage from "../assets/building.png";
import person1Image from "../assets/person1.png";
import person2Image from "../assets/person2.png";
import person3Image from "../assets/person3.png";
import person4Image from "../assets/person4.png";
import bgImage from "../assets/background.png";
import { CustomAccordion } from "./components/CustomAccordion";
import { HorizontalSeparator } from "./components/Separators";

import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import styles from "./Dashboard.css";

// Custom hook, only change is adding "ag-theme-salt-variant-zebra"
function useAgGridHelpers(
  compact = false,
  containerStyles: CSSProperties = {},
): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  columnApi?: ColumnApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (["ag-theme-salt", density].join("-")) {
      case compact && "ag-theme-salt-high":
        return [20, 20];
      case "ag-theme-salt-high":
        return [24, 24];
      case "ag-theme-salt-medium":
        return [36, 36];
      case "ag-theme-salt-low":
        return [48, 48];
      case "ag-theme-salt-touch":
        return [60, 60];
      default:
        return [20, 24];
    }
  }, [density, compact]);

  const className = `ag-theme-salt-${density}${
    compact && density === "high" ? `-compact` : ``
  }-${mode}`;

  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  useEffect(() => {
    // setHeaderHeight doesn't work if not in setTimeout
    setTimeout(() => {
      if (isGridReady) {
        apiRef.current!.api.resetRowHeights();
        apiRef.current!.api.setHeaderHeight(rowHeight);
        apiRef.current!.api.setFloatingFiltersHeight(rowHeight);
        // TODO how to set listItemHeight as the "ag-filter-virtual-list-item" height? Issue 2479

        apiRef.current!.api.sizeColumnsToFit();
      }
    }, 2000);
  }, [rowHeight, isGridReady, listItemHeight]);

  return {
    containerProps: {
      className: clsx("ag-theme-salt-variant-zebra", className),
      style: {
        height: "calc(14 * var(--salt-size-base))",
        width: "100%",
        ...containerStyles,
      },
    },
    agGridProps: {
      onGridReady,
      rowHeight,
      headerHeight: rowHeight,
      suppressMenuHide: true,
      defaultColDef: {
        // filter: true,
        resizable: true,
        sortable: true,
        filterParams: {
          cellHeight: listItemHeight,
        },
      },
    },
    isGridReady,
    api: apiRef.current?.api,
    columnApi: apiRef.current?.columnApi,
  };
}

function HighlightMetric(props: {
  data: { name: string; number: string; date?: string };
}) {
  const {
    data: { name, number, date },
  } = props;
  return (
    <Card>
      <StackLayout gap={0}>
        <Text>
          <strong>{name}</strong>
        </Text>
        <StackLayout gap={0} direction="row" align="baseline">
          <Display3>{number}</Display3>
          <StackLayout gap={0.5} direction="row" align="baseline">
            <Text>
              <strong>.00</strong>
            </Text>
            <Text color="secondary">USD</Text>
          </StackLayout>
        </StackLayout>
        {date ? (
          <Text color="secondary">
            <small>{date}</small>
          </Text>
        ) : null}
      </StackLayout>
    </Card>
  );
}

function EmptyMetric({
  className,
  children,
  ...restProps
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("welcomeCardMetric", "fullHeight", className)}
      {...restProps}
    >
      <FlexLayout
        direction="row"
        gap={0.5}
        align="center"
        justify="center"
        className={"fullHeight"}
      >
        {children}
      </FlexLayout>
    </div>
  );
}

function DashboardWelcome() {
  const [page, setPage] = useState(1);
  const option = {
    dateStyle: "medium",
    timeStyle: "short",
    // timeZoneName: "short",
  } as const;
  const formatedDate = new Intl.DateTimeFormat("default", option).format(
    new Date(),
  );
  const data = [
    {
      name: "Total available balance",
      number: "$1,650,287",
      date: `As of ${formatedDate}`,
    },
    {
      name: "Money in",
      number: "$47,843",
      date: "Last 30 days",
    },
    {
      name: "Money out",
      number: "$8,436",
      date: "Last 30 days",
    },
  ];
  return (
    <Card
      className={"welcomeCard"}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <StackLayout gap={2}>
        <StackLayout gap={1} direction="row">
          <Avatar size={2} />
          <StackLayout gap={0.5}>
            <H1>Welcome, Faith</H1>
            <Text>Last login was 2 days ago</Text>
          </StackLayout>
        </StackLayout>
        <FlowLayout gap={1}>
          <Button appearance="bordered">
            <SendIcon />
            Send a wire
          </Button>
          <Button appearance="bordered">
            <SuccessCircleIcon /> Approve payments
          </Button>
          <Button appearance="bordered">
            <ArrowRightIcon /> Reports inbox
          </Button>
          <Button appearance="bordered">
            <InboxIcon /> Documents inbox
          </Button>
          <Button appearance="bordered">
            <AddIcon /> Add new user
          </Button>
          <Button appearance="bordered">
            <LockedIcon /> Manage user permission
          </Button>
        </FlowLayout>
        <Divider variant="tertiary" />
        <GridLayout
          columns={3}
          rowGap={1}
          columnGap={2}
          className={"cardEqualColumnGrid"}
        >
          <GridItem verticalAlignment="center" colSpan={2}>
            <FlexLayout gap={1} align="baseline">
              <H2>Highlights</H2>
              <Text color="secondary">{"(all values shown in USD)"}</Text>
            </FlexLayout>
          </GridItem>
          <GridItem horizontalAlignment="end">
            <Pagination
              count={2}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
            >
              <CompactPaginator />
            </Pagination>
          </GridItem>
        </GridLayout>

        <FlowLayout>
          {data.map((d) => (
            <FlexItem grow={1} basis={0} shrink={1}>
              <HighlightMetric data={d} key={d.name} />
            </FlexItem>
          ))}
          <FlexItem grow={1} basis={0} shrink={1}>
            <EmptyMetric>
              <AddIcon />
              <Text>
                <strong>Add card</strong>
              </Text>
            </EmptyMetric>
          </FlexItem>
        </FlowLayout>
      </StackLayout>
    </Card>
  );
}

function AccountsAccordion() {
  const { containerProps, agGridProps } = useAgGridHelpers(false, {
    height: "unset", // to support `domLayout="autoHeight"`
  });
  const depositData = [
    {
      account: "Operating Account (•••8374)",
      type: "Checking",
      availableBalance: "14,426.06",
      openingBalance: "12,637.05",
      currentBalance: "12,502.28",
    },
    {
      account: "Payroll (•••5363)",
      type: "Checking",
      availableBalance: "8,502.69",
      openingBalance: "5,948.13",
      currentBalance: "5,948.13",
    },
    {
      account: "AR / AP (•••2734)",
      type: "Checking",
      availableBalance: "16,467.83",
      openingBalance: "16,196.76",
      currentBalance: "15,282.27",
    },
    {
      account: "Company Savings (•••7835)",
      type: "Saving",
      availableBalance: "14,426.06",
      openingBalance: "12,637.05",
      currentBalance: "12,502.28",
    },
  ];

  const columnDefs: ColDef[] = [
    {
      field: "account",
      headerName: "Account name",
    },
    {
      field: "type",
      headerName: "Type",
    },
    {
      field: "availableBalance",
      headerName: "Available balance",
      type: "rightAligned",
    },
    {
      field: "openingBalance",
      headerName: "Opening balance",
      type: "rightAligned",
    },
    {
      field: "currentBalance",
      headerName: "Current balance",
      type: "rightAligned",
    },
    {
      cellRenderer: () => (
        <Button appearance="transparent">
          <MicroMenuIcon />
        </Button>
      ),
      headerName: "Actions",
      width: 40,
      menuTabs: [], // suppress column menu, https://www.ag-grid.com/archive/28.0.0/react-data-grid/column-menu/
    },
  ];
  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <BankIcon size={2} />
          <Text styleAs="h3">Accounts</Text>
        </StackLayout>
      }
      content={
        <>
          <SplitLayout
            align="center"
            startItem={
              <StackLayout direction="row" gap={2}>
                <FormField
                  labelPlacement="left"
                  className={"formFieldLabelFitContent"}
                >
                  <FormFieldLabel>Type</FormFieldLabel>

                  <Dropdown bordered value="Account type">
                    <Option value="Account">Account type</Option>
                  </Dropdown>
                </FormField>
                <FormField
                  labelPlacement="left"
                  className={"formFieldLabelFitContent"}
                >
                  <FormFieldLabel>Accounts</FormFieldLabel>
                  <Dropdown
                    bordered
                    defaultSelected={["All"]}
                    value="All accounts"
                    className={"dashboardAccordionsdropdown"}
                  >
                    <Option value="All">All accounts</Option>
                    <Option value="X12345678">X12345678</Option>
                    <Option value="A09876541">A09876541</Option>
                  </Dropdown>
                </FormField>
              </StackLayout>
            }
            endItem={
              <ToggleButtonGroup defaultValue="list">
                <ToggleButton value="grid" aria-label="Display as grid">
                  <GridIcon />
                </ToggleButton>
                <ToggleButton value="list" aria-label="Display as list">
                  <ListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            }
          />
          <HorizontalSeparator variant="secondary" />
          <StackLayout gap={0}>
            <CustomAccordion
              className={"accordionBlocks"}
              variant="secondary"
              header={
                <SplitLayout
                  align="center"
                  startItem={
                    <StackLayout direction="row" gap={1} align="center">
                      <Text>Deposit accounts</Text>
                    </StackLayout>
                  }
                  endItem={
                    <Label color="secondary">
                      Total available: <strong>1,996,057.97 USD</strong>
                    </Label>
                  }
                />
              }
              content={
                <div {...containerProps}>
                  <AgGridReact
                    rowData={depositData}
                    columnDefs={columnDefs}
                    {...agGridProps}
                    domLayout="autoHeight"
                  />
                </div>
              }
              gap={0}
            />
          </StackLayout>
          <FlowLayout justify="space-between">
            <Button sentiment="accented" appearance="transparent">
              <LinkedIcon /> Link accounts
            </Button>

            <Button sentiment="accented" appearance="transparent">
              View accounts <ArrowRightIcon />
            </Button>
          </FlowLayout>
        </>
      }
    />
  );
}

function MoneyMetric(props: {
  header: string;
  amount: string;
  decimal: string;
  date: string;
}) {
  const { amount, date, decimal, header } = props;
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>{header}</strong>
      </Text>
      <StackLayout gap={1} direction="row" align="center">
        <StackLayout gap={0} direction="row" align="baseline">
          <Text styleAs="display4">{amount}</Text>
          <StackLayout gap={0.5} direction="row" align="baseline">
            <Text>
              <strong>{decimal}</strong>
            </Text>
          </StackLayout>
        </StackLayout>
      </StackLayout>
      <Text color="secondary">
        <small>{date}</small>
      </Text>
    </StackLayout>
  );
}

function MoneyMovementChartAccordion() {
  const options = {
    chart: {
      type: "column",
      styledMode: true,
      height: "55%", // variable doesn't work, "calc(4 * var(--salt-size-base))",
    },
    legend: {
      enabled: true,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: ["Dec-23", "Jan-24", "Feb-24", "Mar-24", "Apr-24", "May-24"],
      crosshair: true,
      accessibility: {
        description: "Months",
      },
    },
    yAxis: {
      opposite: true,
    },
    plotOptions: {
      column: {
        borderRadius: 5, // can't use variable, it's used directly on SVG `rect` rx and ry
      },
    },
    series: [
      {
        name: "Money in",
        data: [151086, 136000, 125500, 141000, 307180, 77000],
      },
      {
        name: "Money out",
        data: [406292, 260000, 307000, 268300, 427500, 214500],
      },
    ],
  };

  const toolbarStart = (
    <StackLayout gap={1} direction="row">
      <FormField labelPlacement="left" className={"formFieldLabelFitContent"}>
        <FormFieldLabel>Time</FormFieldLabel>
        <Dropdown bordered value="Past 6 months">
          <Option value="past-6m">Past 6 months</Option>
          <Option value="past-1y">Past 1 year</Option>
          <Option value="past-3y">Past 3 years</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="left" className={"formFieldLabelFitContent"}>
        <FormFieldLabel>Accounts</FormFieldLabel>
        <Dropdown
          bordered
          value="All accounts"
          className={"dashboardAccordionsdropdown"}
        >
          <Option value="All">All accounts</Option>
          <Option value="X12345678">X12345678</Option>
          <Option value="A09876541">A09876541</Option>
        </Dropdown>
      </FormField>
    </StackLayout>
  );

  const toolbarEnd = (
    <ToggleButtonGroup defaultValue="bar">
      <ToggleButton value="bar" aria-label="Display as bar chart">
        <BarChartIcon />
      </ToggleButton>
      <ToggleButton value="line" aria-label="Display as line chart">
        <LineChartIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <BarChartIcon size={2} />
          <Text styleAs="h3">Money movement over time (USD)</Text>
        </StackLayout>
      }
      content={
        <>
          <FlexItem align="stretch">
            <FlowLayout justify="space-between" gap={1} align="center">
              {toolbarStart}
              {toolbarEnd}
            </FlowLayout>
          </FlexItem>
          <StackLayout gap={2}>
            <FlowLayout gap={3}>
              <MoneyMetric
                header="Money in"
                amount="$1,232,892"
                decimal=".00"
                date="Month to date"
              />
              <MoneyMetric
                header="Money out"
                amount="$2,423,342"
                decimal=".06"
                date="Month to date"
              />
            </FlowLayout>
            <div className={"moneyMovementChart"}>
              <HighchartsReact
                highcharts={Highcharts}
                options={options}
                // @ts-expect-error a workflow use reflow to display correct width on load
                callback={(chart) => setTimeout(() => chart.reflow(), 10000)}
              />
            </div>

            <FlexItem align="end">
              <Button sentiment="accented" appearance="transparent">
                View Transactions <ChevronRightIcon />
              </Button>
            </FlexItem>
          </StackLayout>
        </>
      }
    />
  );
}

function NetSpendRateAccordion() {
  const options = {
    chart: {
      type: "column",
      styledMode: true,
      // className: "burnRateRunWayChart",
      height: "55%", // variable doesn't work, "calc(4 * var(--salt-size-base))",
    },
    legend: {
      enabled: true,
      // verticalAlign: "top",
      // align: "left",
      // symbolRadius: 0,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: ["Dec-23", "Jan-24", "Feb-24", "Mar-24", "Apr-24", "May-24"],
      crosshair: true,
      accessibility: {
        description: "Months",
      },
    },
    yAxis: {
      reversedStacks: false,
      plotLines: [
        {
          width: 2,
          value: 251000,
          zIndex: 5,
          dashStyle: "dash",
          label: { text: "Target spend rate" },
        },
      ],
    },
    plotOptions: {
      column: {
        // colorByPoint: true,
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Expense",
        data: [206292, 260000, 207000, 300000, 227500, 224500],
      },
      {
        name: "Burn Rate Exceeded",
        data: [0, 0, 0, 168300, 0, 0],
      },
    ],
  };
  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <LineChartIcon size={2} />
          <Text styleAs="h3">Net spend rate over time (USD)</Text>
        </StackLayout>
      }
      content={
        <>
          <StackLayout gap={2} align="stretch">
            <FlexItem align="end">
              <ToggleButtonGroup defaultValue="bar">
                <ToggleButton value="bar" aria-label="Display as bar chart">
                  <BarChartIcon />
                </ToggleButton>
                <ToggleButton value="line" aria-label="Display as line chart">
                  <LineChartIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </FlexItem>
            <FlexItem grow={1}>
              <MoneyMetric
                header="Net spend rate"
                amount="$687,568"
                decimal=".39"
                date="Average for last 3 months"
              />
            </FlexItem>

            <FlexItem>
              <HighchartsReact
                highcharts={Highcharts}
                options={options}
                // @ts-expect-error a workflow use reflow to display correct width on load
                callback={(chart) => setTimeout(() => chart.reflow(), 10000)}
              />
            </FlexItem>

            <FlexItem align="end">
              <Button sentiment="accented" appearance="transparent">
                View Terms and Conditions
                <ChevronRightIcon />
              </Button>
            </FlexItem>
          </StackLayout>
        </>
      }
    />
  );
}
function ActionItemsAccordion() {
  const { containerProps, agGridProps } = useAgGridHelpers(false, {
    height: "unset", // to support `domLayout="autoHeight"`
  });
  const rowData = [
    {
      date: "Jan 20, 2025",
      type: "Settings",
      description:
        "Go to Settings to customize your experience within the app ",
    },
    {
      date: "Jan 21, 2025",
      type: "Meeting",
      description:
        "{Banker full name} would like to meet with you and requests you schedule a time",
    },
    {
      date: "Jan 22, 2025",
      type: "Support",
      description:
        "You have a pending support request that needs your attention",
    },
    {
      date: "Jan 23, 2025",
      type: "Support",
      description:
        "You have a pending support request that needs your attention",
    },
    {
      date: "Jan 24, 2025",
      type: "Support",
      description:
        "You have a pending support request that needs your attention",
    },
    {
      date: "Jan 25, 2025",
      type: "Meeting",
      description:
        "{Banker full name} would like to meet with you and requests you schedule a time",
    },
  ];

  const columnDefs: ColDef[] = [
    {
      field: "date",
      headerName: "Date",
    },
    {
      field: "type",
      headerName: "Type",
      // width: 100,
    },
    {
      field: "description",
      headerName: "Description",
    },
    {
      cellRenderer: () => (
        <FlexLayout gap={1} align="center" style={{ height: "100%" }}>
          <FlagIcon aria-hidden />
        </FlexLayout>
      ),
      headerName: "Flags",
      width: 50,
      menuTabs: [], // suppress column menu, https://www.ag-grid.com/archive/28.0.0/react-data-grid/column-menu/
    },
    {
      cellRenderer: () => (
        <FlexLayout gap={1} align="center" style={{ height: "100%" }}>
          <Button appearance="bordered">Start</Button>

          <Button appearance="transparent" aria-label="Menu">
            <MicroMenuIcon aria-hidden />
          </Button>
        </FlexLayout>
      ),
      headerName: "Actions",
      width: 120,
      menuTabs: [], // suppress column menu, https://www.ag-grid.com/archive/28.0.0/react-data-grid/column-menu/
    },
  ];

  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <SuccessCircleIcon size={2} />
          <Text styleAs="h3">Action items</Text>
          <Badge value={5} />
        </StackLayout>
      }
      content={
        <>
          <TabsNext defaultValue="todo">
            <TabBar divider>
              <TabListNext appearance="transparent">
                <TabNext value="todo">
                  <TabNextTrigger>
                    Document and more
                    <Badge value={3} />
                  </TabNextTrigger>
                </TabNext>
                <TabNext value="blocked">
                  <TabNextTrigger>
                    Fraud
                    <Badge value={1} />
                  </TabNextTrigger>
                </TabNext>
                <TabNext value="blocked">
                  <TabNextTrigger>
                    Admin
                    <Badge value={1} />
                  </TabNextTrigger>
                </TabNext>
                <TabNext value="closed">
                  <TabNextTrigger>Approvals</TabNextTrigger>
                </TabNext>
              </TabListNext>
            </TabBar>
          </TabsNext>
          <StackLayout gap={2}>
            <div {...containerProps}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                {...agGridProps}
                className="grid-secondary-header"
                domLayout="autoHeight"
              ></AgGridReact>
            </div>

            <FlexItem align="end">
              <Button sentiment="accented" appearance="transparent">
                View all payment approvals <ChevronRightIcon />
              </Button>
            </FlexItem>
          </StackLayout>
        </>
      }
    />
  );
}

function RecentTransactionsAccordion() {
  const { containerProps, agGridProps } = useAgGridHelpers(false, {
    height: "unset", // to support `domLayout="autoHeight"`
  });
  const rowData = [
    {
      account: "Operating Account (•••8374)",
      completed: "Mar 11, 2024",
      amount: "6,923.07 USD",
      description: "ACH prefunding debit keystone-pacific",
    },
    {
      account: "Payroll (•••5363)",
      completed: "Mar 8, 2024",
      amount: "+ 4,553.55 USD",
      description: "Mobile Check Deposit",
    },
    {
      account: "AR / AP (•••2734)",
      completed: "Mar 8, 2024",
      amount: "623.08 USD",
      description: "Gusto Payroll",
    },
    {
      account: "Company Savings (•••7835)",
      completed: "Mar 8, 2024",
      amount: "1,200.00 USD",
      description: "Outgoing Domestic Wire to Guava Inc.",
    },
    {
      account: "AR / AP (•••2734)",
      completed: "Feb 29, 2024",
      amount: "481.23 USD",
      description: "Payment - AWS invoice 46587123",
    },
  ];

  const columnDefs: ColDef[] = [
    {
      field: "account",
      headerName: "Account name",
    },
    {
      field: "completed",
      headerName: "Completed date",
      width: 100,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "rightAligned", // cellClass won't be applied
      cellClass: (params) => {
        if (params.value.startsWith("+")) {
          return clsx("fgPositive", "ag-right-aligned-cell", "fontStrong");
        } else if (params.value.startsWith("-")) {
          return clsx("fgNegative", "ag-right-aligned-cell", "fontStrong");
        }
        return clsx("ag-right-aligned-cell", "fontStrong");
      },
    },
    {
      field: "description",
      headerName: "Description",
    },
    {
      cellRenderer: () => (
        <Button appearance="transparent">
          <MicroMenuIcon />
        </Button>
      ),
      width: 60,
      menuTabs: [], // suppress column menu, https://www.ag-grid.com/archive/28.0.0/react-data-grid/column-menu/
    },
  ];

  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <SwapIcon size={2} />
          <Text styleAs="h3">Recent transactions</Text>
        </StackLayout>
      }
      content={
        <>
          <Dropdown
            bordered
            defaultSelected={["All"]}
            value="All accounts"
            className={"dashboardAccordionsdropdown"}
            style={{ width: "100%" }}
          >
            <Option value="All">All accounts</Option>
            <Option value="X12345678">X12345678</Option>
            <Option value="A09876541">A09876541</Option>
          </Dropdown>
          <StackLayout gap={2}>
            <div {...containerProps}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                {...agGridProps}
                className="grid-secondary-header"
                domLayout="autoHeight"
              ></AgGridReact>
            </div>

            <FlexItem align="end">
              <Button sentiment="accented" appearance="transparent">
                View all payment approvals <ChevronRightIcon />
              </Button>
            </FlexItem>
          </StackLayout>
        </>
      }
    />
  );
}

type MemberInfo = {
  img: string;
  name: string;
  role: string;
  phone: string;
  email: string;
};

function TeamMemberInfo(props: { info: MemberInfo }) {
  const {
    info: { email, img, name, phone, role },
  } = props;
  return (
    <StackLayout direction="row" gap={2}>
      <Avatar size={2} src={img} />
      <StackLayout gap={1}>
        <Text styleAs="h2">{name}</Text>
        <StackLayout gap={0.5}>
          <StackLayout direction="row" align="center" gap={1}>
            <UserIcon />
            {role}
          </StackLayout>
          <StackLayout direction="row" align="center" gap={1}>
            <CallIcon />
            {phone}
          </StackLayout>
          <StackLayout direction="row" align="center" gap={1}>
            <MessageIcon />
            <QuickActionLink href={`mailto:${email}`}>{email}</QuickActionLink>
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </StackLayout>
  );
}

const teamMembers: MemberInfo[] = [
  {
    img: person1Image,
    name: "Stacey Smith",
    role: "Banker",
    phone: "+1 (212) 555-0100",
    email: "stacey.smith@example.com",
  },
  {
    img: person2Image,
    name: "Allen Jones",
    role: "Banker",
    phone: "+1 (212) 555-0100",
    email: "allen.jones@example.com",
  },
  {
    img: person3Image,
    name: "Mike Diamond",
    role: "Banker",
    phone: "+1 (212) 555-0100",
    email: "mike.diamond@example.com",
  },
  {
    img: person4Image,
    name: "Brian Stipe",
    role: "Banker",
    phone: "+1 (212) 555-0100",
    email: "brian.stipe@example.com",
  },
];

function YourTeamAccordion() {
  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <UserGroupIcon size={2} />
          <Text styleAs="h3">Your team</Text>
        </StackLayout>
      }
      content={
        <>
          <HorizontalSeparator variant="secondary" />

          <FlowLayout>
            {teamMembers.map((info) => (
              <FlexItem grow={1} basis={0} shrink={1}>
                <TeamMemberInfo info={info} key={info.name} />
              </FlexItem>
            ))}
          </FlowLayout>
        </>
      }
    />
  );
}

function CBFooter() {
  return (
    <StackLayout gap={6} separators>
      <FlexItem>{/* Empty to use `separators` */}</FlexItem>

      <StackLayout align="start">
        <StackLayout direction="row">
          <QuickActionLink>Accessibility</QuickActionLink>
          <QuickActionLink>Disclosures</QuickActionLink>
          <QuickActionLink>Privacy policy</QuickActionLink>
          <QuickActionLink>Cookie policy</QuickActionLink>
          <QuickActionLink>Terms of use</QuickActionLink>
        </StackLayout>
        <Text>
          © 2024 JPMorgan Chase & Co. All rights reserved. “Access by J.P.
          Morgan Chase” are trademarks of JPMorgan Chase Bank, N.A. Member FDIC.
        </Text>
      </StackLayout>
    </StackLayout>
  );
}

function QuickActionLink(props: LinkProps) {
  return (
    <Link
      // color="accent"
      href="#"
      className={"quickActionLink"}
      {...props}
    />
  );
}

function QuickActionsAccordion() {
  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <FavoriteIcon size={2} />
          <Text styleAs="h3">Quick actions</Text>
        </StackLayout>
      }
      content={
        <>
          <HorizontalSeparator variant="secondary" />

          <GridLayout columns={2}>
            <GridItem>
              <StackLayout>
                <StackLayout gap={1} as="section" align="start">
                  <H3>Move money</H3>
                  <QuickActionLink>Send a wire</QuickActionLink>
                  <QuickActionLink>Payment approval</QuickActionLink>
                </StackLayout>
                <StackLayout gap={1} as="section" align="start">
                  <H3>Quick access</H3>
                  <QuickActionLink>Reports inbox</QuickActionLink>
                  <QuickActionLink>Available reports</QuickActionLink>
                  <QuickActionLink>Recent bank statements</QuickActionLink>
                  <QuickActionLink>Recent billing statements</QuickActionLink>
                  <QuickActionLink>Documents Inbox</QuickActionLink>
                </StackLayout>
              </StackLayout>
            </GridItem>
            <GridItem>
              <StackLayout>
                <StackLayout gap={1} as="section" align="start">
                  <H3>Administration</H3>
                  <QuickActionLink>Add a new user</QuickActionLink>
                  <QuickActionLink>Manage user permissions</QuickActionLink>
                </StackLayout>
                <StackLayout gap={1} as="section" align="start">
                  <H3>Add new or update</H3>
                  <QuickActionLink>Alerts</QuickActionLink>
                  <QuickActionLink>Recipients</QuickActionLink>
                  <QuickActionLink>Profile settings</QuickActionLink>
                </StackLayout>
              </StackLayout>
            </GridItem>
          </GridLayout>
        </>
      }
    />
  );
}

function ForYouAccordion() {
  return (
    <CustomAccordion
      disableCollapse
      className={"accordionBlocks"}
      defaultExpanded
      header={
        <StackLayout direction="row" gap={1} align="center">
          <DiamondIcon size={2} />
          <Text styleAs="h3">For you</Text>
        </StackLayout>
      }
      content={
        <>
          <HorizontalSeparator variant="secondary" />

          <SplitLayout
            align="center"
            startItem={<H3>Sed ut perspiciatis unde omnis iste natus</H3>}
            endItem={
              <StackLayout gap={1} direction="row">
                <Button aria-label="Previous page" appearance="transparent">
                  <ChevronLeftIcon />
                </Button>
                <Button aria-label="Next page" appearance="transparent">
                  <ChevronRightIcon />
                </Button>
              </StackLayout>
            }
          />

          <img
            src={buildingImage}
            alt="J.P. Morgan Building"
            loading="lazy"
            style={{ aspectRatio: "6/2", objectFit: "cover", maxHeight: 260 }}
          />

          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </Text>

          <FlexItem align="end">
            <QuickActionLink>
              View full article <ArrowRightIcon />
            </QuickActionLink>
          </FlexItem>
        </>
      }
    />
  );
}

function DashboardLeftColumn() {
  return (
    <StackLayout gap={3} className={clsx("dashboardAccordions", "contentGrid")}>
      <DashboardWelcome />

      {/* <TasksAccordion /> */}

      <AccountsAccordion />

      <GridLayout
        gap={3}
        // TODO: find out why this is not responsive
        columns={{
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
        }}
        className={"contentGrid"}
      >
        <ActionItemsAccordion />
        <RecentTransactionsAccordion />
      </GridLayout>

      <GridLayout
        gap={3}
        // TODO: find out why this is not responsive
        columns={{
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
        }}
        className={"contentGrid"}
      >
        <MoneyMovementChartAccordion />
        <NetSpendRateAccordion />
      </GridLayout>
      <GridLayout
        gap={3}
        // TODO: find out why this is not responsive
        columns={{
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
        }}
        className={"contentGrid"}
      >
        <QuickActionsAccordion />

        <ForYouAccordion />
      </GridLayout>

      {/* <AccountsGridAccordion /> */}

      <YourTeamAccordion />

      <CBFooter />
    </StackLayout>
  );
}

function DashboardBody() {
  return (
    <main className={clsx("mainContent")}>
      <StackLayout className={"dashboardBody"} gap={1}>
        <DashboardLeftColumn />
      </StackLayout>
    </main>
  );
}

export function Dashboard() {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-story-raichu-dashboard",
    css: styles,
    window: targetWindow,
  });
  return <DashboardBody />;
}
