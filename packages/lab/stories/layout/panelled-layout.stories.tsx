import {
  PanelledLayout,
  FlexLayout,
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  Tabstrip,
  DeckLayout,
  OrderedButton,
  ButtonBar,
  Dropdown,
  FormField,
  FlexItem,
  SplitLayout,
  PanelFlexLayout,
} from "@brandname/lab";
import { Button } from "@brandname/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";
import { RefreshIcon, WarningIcon } from "@brandname/icons";

export default {
  title: "Layout/PanelledLayout",
  component: PanelledLayout,
} as ComponentMeta<typeof PanelledLayout>;

const flexItemStyles = {
  background: "lightcyan",
  height: "100%",
};
const flexLayoutStyle = {
  minWidth: 1000,
  height: 500,
  background: "lightblue",
};

const Template: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <PanelledLayout style={flexLayoutStyle}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexLayout style={flexItemStyles} key={index} {...args}>
          <p>{`Panel ${index + 1}`}</p>
        </FlexLayout>
      ))}
    </PanelledLayout>
  );
};
export const ToolkitPanelledLayout = Template.bind({});
ToolkitPanelledLayout.args = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

ToolkitPanelledLayout.argTypes = {
  display: {
    options: ["flex", "inline-flex"],
    control: { type: "radio" },
  },
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};
const tableStyle = {
  padding: "5px",
};
const PanelledDashboard: ComponentStory<typeof FlexLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const bottomTabs = ["SSI", "Trade"];
  const importanceData = ["High", "Medium", "low"];
  const statusData = ["To do", "In progress", "Done"];

  return (
    <PanelledLayout {...args} style={{ alignItems: "stretch" }}>
      <FlexLayout direction={"column"} height="100%">
        <h2>General Information</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium
        </p>
        <p>
          Ad amet debitis dolore eaque eius eum hic in ipsum magnam nesciunt,
          provident quasi quia quidem reprehenderit sed soluta suscipit velit.
        </p>
        <ButtonBar
          data-testid="button-bar"
          stackAtBreakpoint={0}
          style={{ flexGrow: 1, alignItems: "end" }}
        >
          <OrderedButton align={"left"}>Save as draft</OrderedButton>
          <OrderedButton variant="cta">Save</OrderedButton>
          <OrderedButton>Cancel</OrderedButton>
        </ButtonBar>
      </FlexLayout>
      <FlexLayout height="100%" direction={"column"}>
        <h2 style={{ width: "100%" }}>Task Overview</h2>
        <section>
          <FormField label="Importance" style={{ maxWidth: "150px" }}>
            <Dropdown
              initialSelectedItem={importanceData[0]}
              source={importanceData}
            />
          </FormField>
          <FormField style={{ maxWidth: "150px" }} label="Status">
            <Dropdown initialSelectedItem={statusData[0]} source={statusData} />
          </FormField>
        </section>
        <section>
          <FormField label="Importance" style={{ maxWidth: "150px" }}>
            <Dropdown
              initialSelectedItem={importanceData[0]}
              source={importanceData}
            />
          </FormField>
          <FormField style={{ maxWidth: "150px" }} label="Status">
            <Dropdown initialSelectedItem={statusData[0]} source={statusData} />
          </FormField>
        </section>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>

        <ButtonBar
          data-testid="button-bar"
          stackAtBreakpoint={0}
          style={{ flexGrow: 1, alignItems: "end" }}
        >
          <OrderedButton>Follow</OrderedButton>
          <OrderedButton>Share</OrderedButton>
        </ButtonBar>
      </FlexLayout>
      <FlexLayout>
        <div>
          <h2>Task Comments</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
      </FlexLayout>
      <FlexLayout direction="column">
        <Tabstrip onChange={handleTabSelection} defaultTabs={bottomTabs} />
        <DeckLayout activeIndex={selectedTab}>
          {bottomTabs.map((label, idx) => (
            <div
              aria-hidden={selectedTab !== idx}
              key={idx}
              style={{
                padding: 10,
              }}
            >
              <table>
                <tr style={{ textAlign: "left" }}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <th style={tableStyle}>{`${label} ${index}`}</th>
                  ))}
                </tr>
                {Array.from({ length: 3 }, (_, index) => {
                  return (
                    <tr key={index}>
                      <td style={tableStyle}>Lorem ipsum dolor</td>
                      <td style={tableStyle}>Ad aliquam</td>
                      <td style={tableStyle}>architecto cumque</td>
                      <td style={tableStyle}>dolor doloribus</td>
                      <td style={tableStyle}>eos ex incidunt</td>
                    </tr>
                  );
                })}
              </table>
            </div>
          ))}
        </DeckLayout>
      </FlexLayout>
    </PanelledLayout>
  );
};
export const PanelledLayoutDashboard = PanelledDashboard.bind({});
PanelledLayoutDashboard.args = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

PanelledLayoutDashboard.argTypes = {
  display: {
    options: ["flex", "inline-flex"],
    control: { type: "radio" },
  },
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};

const PanelledMetrics: ComponentStory<typeof FlexLayout> = ({
  title,
  ...args
}) => {
  const getMetric = (base: number) => Math.round(base * Math.random()) / 100;
  const getTableTime = () =>
    `${new Date(
      new Date(2022, Math.random() * 5, 1).getDate().toLocaleString("en-US")
    )}`;

  const statusData = ["To do", "In progress", "Done"];
  const tableHeaderData = [
    "Status",
    "Account",
    "Method",
    "Amount",
    "Fraud Service",
    "Time until cut-off",
  ];
  const tableTextData = [
    "Lorem ipsum dolor sit amet",
    "consectetur adipisicing elit",
    "Consequuntur cumque cupiditate doloremque",
    "ducimus enim est eum ex in inventore non",
    "nostrum numquam possimus quae sapiente",
    "tempora tenetur ut, vel voluptates!",
  ];

  return (
    <FlexLayout
      style={{ width: "100%", paddingTop: "1rem" }}
      direction={"column"}
    >
      <FlexItem>
        <SplitLayout>
          <h2>{title}</h2>
          <Button variant="cta">
            <WarningIcon /> Report an insident
          </Button>
        </SplitLayout>
      </FlexItem>
      <PanelFlexLayout {...args} style={{ alignItems: "stretch" }}>
        <FlexLayout
          resizeable
          direction={"column"}
          style={{ border: "solid 1px grey", padding: "1rem" }}
        >
          <SplitLayout>
            <h2>Unusual Transaction Activity</h2>
            <SplitLayout>
              <p>As of {getTableTime()}</p>
              <Button>
                <RefreshIcon />
              </Button>
            </SplitLayout>
          </SplitLayout>
          <table>
            <tr style={{ textAlign: "left" }}>
              {Array.from({ length: 6 }, (_, index) => (
                <th style={tableStyle}>{tableHeaderData[index]}</th>
              ))}
            </tr>
            {Array.from({ length: 7 }, (_, index) => {
              return (
                <tr key={index}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <td style={tableStyle}>
                      {!(index & 1)
                        ? tableTextData[Math.floor(Math.random() * 5)]
                        : getMetric(12345678)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </table>
          <ButtonBar
            data-testid="button-bar"
            stackAtBreakpoint={0}
            style={{ flexGrow: 1, alignItems: "end" }}
          >
            <OrderedButton variant="cta">View all activity</OrderedButton>
          </ButtonBar>
        </FlexLayout>
        <FlexItem resizeable>
          <PanelFlexLayout direction="column">
            <FlexLayout
              resizeable
              height="100%"
              direction={"column"}
              style={{ border: "solid 1px grey", padding: "1rem" }}
            >
              <SplitLayout>
                <h2>Account Health</h2>
                <SplitLayout>
                  <p>As of {getTableTime()}</p>
                  <Button>
                    <RefreshIcon />
                  </Button>
                </SplitLayout>
              </SplitLayout>
              <div>
                <SplitLayout>
                  <p>Unprotected Accounts</p>
                  <p
                    style={{
                      background: "red",
                      width: "3rem",
                      color: "white",
                      padding: "0.5rem",
                      textAlign: "end",
                    }}
                  >
                    23
                  </p>
                </SplitLayout>
                <SplitLayout>
                  <p>Partially Protected Accounts</p>
                  <p
                    style={{
                      background: "orange",
                      width: "3rem",
                      color: "white",
                      padding: "0.5rem",
                      textAlign: "end",
                    }}
                  >
                    3
                  </p>
                </SplitLayout>
                <SplitLayout>
                  <p>Fully Protected Accounts</p>
                  <p
                    style={{
                      background: "green",
                      width: "3rem",
                      color: "white",
                      padding: "0.5rem",
                      textAlign: "end",
                    }}
                  >
                    59
                  </p>
                </SplitLayout>
              </div>
            </FlexLayout>
            <FlexLayout
              resizeable
              height="100%"
              direction={"column"}
              style={{ border: "solid 1px grey", padding: "1rem" }}
            >
              <SplitLayout>
                <h2>Rules</h2>
                <SplitLayout>
                  <p>As of {getTableTime()}</p>
                  <Button>
                    <RefreshIcon />
                  </Button>
                </SplitLayout>
              </SplitLayout>
              <table>
                <tr style={{ textAlign: "left" }}>
                  <th style={tableStyle}>Status</th>
                  <th style={tableStyle}>Rule name</th>
                  <th style={tableStyle}>Last Updated</th>
                </tr>
                {Array.from({ length: 4 }, (_, index) => {
                  return (
                    <tr key={index}>
                      <td style={tableStyle}>
                        {statusData[Math.floor(Math.random() * 3)]}
                      </td>
                      <td style={tableStyle}>
                        {tableTextData[Math.floor(Math.random() * 5)]}
                      </td>
                      <td style={tableStyle}>{getMetric(12345678)}</td>
                    </tr>
                  );
                })}
              </table>
              <ButtonBar
                data-testid="button-bar"
                stackAtBreakpoint={0}
                style={{ flexGrow: 1, alignItems: "end" }}
              >
                <OrderedButton variant="cta">View rules</OrderedButton>
              </ButtonBar>
            </FlexLayout>
          </PanelFlexLayout>
        </FlexItem>
      </PanelFlexLayout>
    </FlexLayout>
  );
};
export const PanelledSecurityMetrics = PanelledMetrics.bind({});
PanelledSecurityMetrics.args = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  title: "Security center",
};

PanelledSecurityMetrics.argTypes = {
  display: {
    options: ["flex", "inline-flex"],
    control: { type: "radio" },
  },
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};
