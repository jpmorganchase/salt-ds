import { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  ParentChildLayout,
  ToolkitProvider,
} from "@jpmorganchase/uitk-core";
import {
  EditableLabel,
  Link,
  Tab,
  TabDescriptor,
  Tabstrip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Text,
} from "@jpmorganchase/uitk-lab";

import { AdjustableFlexbox } from "../story-components";

export default {
  title: "Lab/Tabs/Standalone Tabstrip",
  component: Tabstrip,
};

type colourMap = { [key: string]: string };
const _colours = [
  "yellow",
  "red",
  "cornflowerblue",
  "brown",
  "green",
  "purple",
  "orange",
  "lime",
  "silver",
  "maroon",
];

const getTabColours = (tabs: string[] | TabDescriptor[]): colourMap => {
  const tabStrings: string[] = tabs.map((tab: string | TabDescriptor) =>
    typeof tab === "string" ? tab : tab.label
  );
  return tabStrings.reduce(
    (map: colourMap, tab: string, i: number) => ({
      ...map,
      [tab]: _colours[i],
    }),
    {} as colourMap
  );
};

const CloseTabWarningDialog = ({
  closedTab,
  onCancel,
  onClose,
  onConfirm,
  open = false,
}: {
  closedTab: TabDescriptor;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  open?: boolean;
}) => (
  <Dialog open={open} state="warning" onClose={onClose}>
    <DialogTitle onClose={onClose}>Do you want to close this tab?</DialogTitle>
    <DialogContent>
      {`Closing the tab will cause any changes made to
                '${closedTab.label}' to be lost.`}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} variant="cta">
        Close Tab
      </Button>
    </DialogActions>
  </Dialog>
);

const useTabSelection = (initialValue?: number) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    // console.log(
    //   `%ctabstrip.story setSelectedTab ${tabIndex}`,
    //   "color:red;font-weight: bold;"
    // );
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection] as const;
};

interface TabPanelProps {
  tabs: string[] | TabDescriptor[];
  colours?: colourMap;
  activeTabIndex: number;
}

const TabPanel = ({ tabs, activeTabIndex }: TabPanelProps) => {
  const tab = tabs[activeTabIndex];
  const label = typeof tab === "string" ? tab : tab.label;
  return (
    <div key={activeTabIndex} style={{ paddingTop: 20 }}>
      <Text>{`Content for ${label} tab`}</Text>
    </div>
  );
};

const tabsAsStrings = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
const tabsAsStringsLong = tabsAsStrings.concat([
  "Reports",
  "Statements",
  "Administration",
  "Virtual Branch",
  "More Services",
]);

export const Default = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <ToolkitProvider>
      <Tabstrip
        onActiveChange={setActiveTabIndex}
        style={{ width: 600 }}
        id="ts"
      >
        {tabs.map((label, i) => (
          <Tab
            label={label}
            ariaControls={i === activeTabIndex ? `ts-panel-${i}` : undefined}
          />
        ))}
      </Tabstrip>
      <div
        id={`ts-panel-${activeTabIndex}`}
        aria-labelledby={`ts-${activeTabIndex}`}
        role="tabpanel"
      >
        <Text>{tabs[activeTabIndex]}</Text>
      </div>
      <br />
      <br />
    </ToolkitProvider>
  );
};

export const Overflow = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  return (
    <ToolkitProvider>
      <div>1) Tab definitions as an array of strings</div>
      <div style={{ height: 30, width: 600 }}>
        <Tabstrip
          onActiveChange={handleTabSelection}
          source={tabsAsStringsLong}
        />
        <TabPanel tabs={tabsAsStringsLong} activeTabIndex={selectedTab} />
      </div>
      <br />
      <br />
    </ToolkitProvider>
  );
};

export const ActiveTabDefinedByProp = () => {
  const [selectedTab, handleTabSelection] = useTabSelection(1);
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        onActiveChange={handleTabSelection}
        activeTabIndex={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripWithOverflow = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = [
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
    "Reports",
    "Statements",
    "Administration",
    "Virtual Branch",
    "More Services",
  ];

  return (
    <AdjustableFlexbox>
      <Tabstrip onActiveChange={handleTabSelection}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </AdjustableFlexbox>
  );
};

export const TabstripWithoutOverflow = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const tabs = [
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
    "Reports",
    "Statements",
    "Administration",
    "Virtual Branch",
    "More Services",
  ];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip onActiveChange={handleTabSelection} overflowMenu={false}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripCentered = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const tabs = [
    "Home",
    "Transactions",
    "FX",
    "2018 US Equity Year Ahead Outlook",
  ];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        centered
        onActiveChange={handleTabSelection}
        overflowMenu={false}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const LowEmphasisTabstrip = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        emphasis="low"
        onActiveChange={handleTabSelection}
        overflowMenu={false}
        activeTabIndex={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TheFullMonty = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions" },
    { label: "Loans" },
    { label: "Checks" },
    { label: "Liquidity" },
  ]);
  const [closingTabIndex, setClosingTabIndex] = useState<number | undefined>(
    undefined
  );

  //TODO add confirmation dialog
  const handleAddTab = () => {
    const count = tabs.length;
    setTabs((state) => state.concat([{ label: `Tab ${state.length + 1}` }]));
    setSelectedTab(count);
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onTabShouldClose = (index: number) => {
    setIsDialogOpen(true);
    setClosingTabIndex(index);
  };

  const onTabDidClose = () => {
    // This will always be true if we reach this code path, but TypeScript needs the clarification
    if (closingTabIndex !== undefined) {
      const newTabs = [...tabs];
      newTabs.splice(closingTabIndex, 1);

      let newSelectedTab = selectedTab;
      if (selectedTab > closingTabIndex || newTabs.length === selectedTab) {
        newSelectedTab--;
      }

      setSelectedTab(newSelectedTab);
      setTabs(newTabs);
    }
  };

  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const onDidConfirmTabClose = () => {
    onTabDidClose();
    setIsDialogOpen(false);
    setClosingTabIndex(undefined);
  };

  const onDialogDidClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onActiveChange={handleTabSelection}
        onCloseTab={onTabShouldClose}
        activeTabIndex={selectedTab}
      >
        {tabs.map(({ label, closeable }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
      {isDialogOpen && typeof closingTabIndex === "number" && (
        <CloseTabWarningDialog
          closedTab={tabs[closingTabIndex]}
          onCancel={onDialogDidClose}
          onClose={onDialogDidClose}
          onConfirm={onDidConfirmTabClose}
          open
        />
      )}
    </div>
  );
};
export const TheFullMontyNoConfirmation = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions" },
    { label: "Loans" },
    { label: "Checks" },
    { label: "Liquidity" },
  ]);

  //TODO add confirmation dialog
  const handleAddTab = () => {
    const count = tabs.length;
    setTabs((state) => state.concat([{ label: `Tab ${state.length + 1}` }]));
    setSelectedTab(count);
  };

  const onTabDidClose = (closingTabIndex: number) => {
    // This will always be true if we reach this code path, but TypeScript needs the clarification
    if (closingTabIndex !== undefined) {
      const newTabs = [...tabs];
      newTabs.splice(closingTabIndex, 1);

      let newSelectedTab = selectedTab;
      if (selectedTab > closingTabIndex || newTabs.length === selectedTab) {
        newSelectedTab--;
      }

      setSelectedTab(newSelectedTab);
      setTabs(newTabs);
    }
  };

  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onActiveChange={handleTabSelection}
        onCloseTab={onTabDidClose}
        activeTabIndex={selectedTab}
      >
        {tabs.map(({ label, closeable }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

// TODO related to how we handle custom tabs
export const TabstripLink = ({ height }: { height: number }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Google"];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip onActiveChange={handleTabSelection} overflowMenu={false}>
        <Tab label="Home" />
        <Tab label="Transactions" />
        <Tab label="Loans" />
        <Tab label="Checks" />
        <Tab>
          <Link href="https://google.com" target="_blank">
            Google
          </Link>
        </Tab>
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const CustomTabContent = ({ height }: { height: number }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Google"];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip onActiveChange={handleTabSelection} overflowMenu={false}>
        <Tab label="Home" />
        <Tab label="Transactions" />
        <Tab label="Loans" />
        <Tab label="Checks" />
        <Tab>
          <Link href="https://google.com" target="_blank">
            Google
          </Link>
        </Tab>
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripControlledAddNew = () => {
  const [activeTabIndex, setSelectedTabIndex] = useTabSelection();
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  //TODO add confirmation dialog
  const tabCount = tabs.length;
  const newTabCount = useRef(0);
  const handleAddTab = () => {
    newTabCount.current += 1;
    setTabs((state) =>
      state.concat([
        `New Tab${newTabCount.current > 1 ? " " + newTabCount.current : ""}`,
      ])
    );
    setSelectedTabIndex(tabCount);
  };

  return (
    <div style={{ height: 300, width: 250 }}>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onActiveChange={setSelectedTabIndex}
        activeTabIndex={activeTabIndex}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={activeTabIndex} />
    </div>
  );
};

export const TabstripAddNew = () => {
  const [activeTabIndex, setSelectedTabIndex] = useTabSelection();
  const tabs = useMemo(() => {
    return tabsAsStrings.slice(0, 2);
  }, []);

  return (
    // <ComponentAnatomy>
    <div style={{ height: 300, width: 250 }}>
      <Tabstrip enableAddTab onActiveChange={setSelectedTabIndex}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={activeTabIndex} />
    </div>
    // </ComponentAnatomy>
  );
};

export const TabstripControlledAddAndDelete = () => {
  const [activeTabIndex, setSelectedTabIndex] = useTabSelection();
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  //TODO add confirmation dialog
  const tabCount = tabs.length;
  const newTabCount = useRef(0);
  const handleAddTab = () => {
    newTabCount.current += 1;
    const labelWithCount = ` ${newTabCount.current}`;
    setTabs((state) =>
      state.concat([`New Tab${newTabCount.current > 1 ? labelWithCount : ""}`])
    );
    setSelectedTabIndex(tabCount);
  };

  const handleCloseTab = (tabIndex: number) => {
    newTabCount.current += 1;
    // colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
    if (activeTabIndex > tabIndex) {
      setSelectedTabIndex(activeTabIndex - 1);
    }
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onActiveChange={setSelectedTabIndex}
        onCloseTab={handleCloseTab}
        activeTabIndex={activeTabIndex}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={activeTabIndex} />
    </div>
  );
};

export const TabstripAddNewWithRename = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  const newTabCount = useRef(0);
  const handleAddTab = () => {
    newTabCount.current += 1;
    const labelWithCount = ` ${newTabCount.current}`;
    setTabs((state) =>
      state.concat([`New Tab${newTabCount.current > 1 ? labelWithCount : ""}`])
    );
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        enableRenameTab
        onAddTab={handleAddTab}
        onActiveChange={handleTabSelection}
        defaultActiveTabIndex={0}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripUncontrolledStringTabsAddNewWithRename = ({
  height,
}: {
  height: number;
}) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions"];
  //TODO add confirmation dialog

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        defaultSource={tabs}
        enableAddTab
        enableRenameTab
        onActiveChange={handleTabSelection}
        defaultActiveTabIndex={0}
      />
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

// TODO pointless example, remove from TK 1.0
export const TabstripAddNewWithoutAscendingNumber = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  const handleAddTab = () => {
    setTabs((state) => state.concat(["New Tab"]));
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onActiveChange={handleTabSelection}
        overflowMenu={false}
        activeTabIndex={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

// TODO another pointless example
export const TabstripAddNewAlternativeDefaultName = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  //TODO add confirmation dialog
  const newTabCount = useRef(0);
  const handleAddTab = () => {
    newTabCount.current += 1;
    const labelWithCount = ` ${newTabCount.current}`;
    setTabs((state) =>
      state.concat([`New Tab${newTabCount.current > 1 ? labelWithCount : ""}`])
    );
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onActiveChange={handleTabSelection}
        overflowMenu={false}
        activeTabIndex={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

// TODO BUG after we close from overflow
export const TabstripCloseConfigured = ({ height }: { height: number }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions", closeable: false },
    { label: "Liquidity", closeable: true },
    { label: "Reports", closeable: true },
    { label: "Statements", closeable: true },
    { label: "Administration", closeable: true },
    { label: "Virtual Branch", closeable: true },
    { label: "More Services", closeable: true },
  ]);
  const handleCloseTab = (tabIndex: number) => {
    console.log(`deleteTab ${tabIndex}`);
    // remove the color as well, else they will appear on different tabs
    // colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        onActiveChange={handleTabSelection}
        onCloseTab={handleCloseTab}
        activeTabIndex={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripCloseDeclarative = ({
  height,
  width = 1000,
}: {
  height: number;
  width?: number;
}) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions", closeable: false },
    { label: "Liquidity", closeable: true },
    { label: "Reports", closeable: true },
    { label: "Statements", closeable: true },
    { label: "Administration", closeable: true },
    { label: "Virtual Branch", closeable: true },
    { label: "More Services", closeable: true },
  ]);
  const handleDeleteTab = (tabIndex: number) => {
    console.log(`handle delete in story`);
    // remove the color as well, else they will appear on different tabs
    // colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        onActiveChange={handleTabSelection}
        onCloseTab={handleDeleteTab}
        activeTabIndex={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripCloseWithConfirmationDialog = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions", closeable: false },
    { label: "Loans", closeable: true },
    { label: "Checks", closeable: true },
    { label: "Liquidity", closeable: true },
    { label: "Reports", closeable: true },
    { label: "Statements", closeable: true },
    { label: "Administration", closeable: true },
    { label: "Virtual Branch", closeable: true },
    { label: "More Services", closeable: true },
  ]);
  const handleDeleteTab = (tabIndex: number) => {
    // remove the color as well, else they will appear on different tabs
    // colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        onActiveChange={handleTabSelection}
        onCloseTab={handleDeleteTab}
        activeTabIndex={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const TabstripRename = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        onActiveChange={handleTabSelection}
        overflowMenu={false}
        activeTabIndex={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab editable label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};

export const VerticalTabs = () => {
  const [activeTabIndex, setActiveTabIndex] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <ParentChildLayout
      child={<TabPanel tabs={tabs} activeTabIndex={activeTabIndex} />}
      parent={
        <Tabstrip onActiveChange={setActiveTabIndex} orientation="vertical">
          {tabs.map((label, i) => (
            <Tab label={label} key={i} />
          ))}
        </Tabstrip>
      }
      style={{ width: 600 }}
    />
  );
};

export const EditableLabelUncontrolledValueUncontrolledEditing = () => {
  const handleEnterEditMode = () => {
    console.log("handleEnterEditMode");
  };

  const handleExitEditMode = (value?: string) => {
    console.log(`handleExitEditMode `, { value });
  };

  return (
    <div
      style={{
        display: "inline-block",
        border: "solid 1px #ccc",
        position: "absolute",
        top: 100,
        left: 100,
      }}
    >
      <EditableLabel
        defaultValue="test"
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
    </div>
  );
};

export const EditableLabelControlledValueUncontrolledEditing = () => {
  const [value, setValue] = useState<string>("Initial value");

  const handleEnterEditMode = () => {
    console.log("handleEnterEditMode");
  };

  const handleExitEditMode = (finalValue = "") => {
    console.log(`handleExitEditMode '${value}'`);
    if (finalValue !== value) {
      // edit was cancelled
      setValue(finalValue);
    }
  };

  return (
    <div
      style={{
        display: "inline-block",
        border: "solid 1px #ccc",
        position: "absolute",
        top: 100,
        left: 100,
      }}
    >
      <EditableLabel
        value={value}
        onChange={setValue}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
    </div>
  );
};

export const EditableLabelUncontrolledValueControlledEditing = () => {
  const [editing, setEditing] = useState(false);

  const handleEnterEditMode = () => {
    setEditing(true);
  };

  const handleExitEditMode = (value = "") => {
    setEditing(false);
    console.log(`handleExitEditMode '${value}'`);
  };

  return (
    <div
      style={{
        display: "inline-block",
        border: "solid 1px #ccc",
        position: "absolute",
        top: 100,
        left: 100,
      }}
    >
      <EditableLabel
        defaultValue="test"
        editing={editing}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
    </div>
  );
};

export const EditableLabelControlledValueControlledEditingEditOnMount = () => {
  const [editing, setEditing] = useState(true);
  const [value, setValue] = useState("Initial value");

  const handleEnterEditMode = () => {
    setEditing(true);
  };

  const handleExitEditMode = (finalValue = "") => {
    setEditing(false);
    if (finalValue !== value) {
      // edit was cancelled
      setValue(finalValue);
    }
  };

  return (
    <div
      style={{
        display: "inline-block",
        border: "solid 1px #ccc",
        position: "absolute",
        top: 100,
        left: 100,
      }}
    >
      <EditableLabel
        value={value}
        editing={editing}
        onChange={setValue}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
    </div>
  );
};

const tabLabels = [
  "Tab Test 1",
  "Tab Test 2",
  "Tab Test 3",
  "Tab Test 4",
  "Tab Test 5",
  "Tab Test 6",
  "Tab Test 7",
  "Tab Test 8",
];
// const tabLabels = [
//   "Home",
//   "Transactions",
//   "Loans",
//   "Checks",
//   "Liquidity",
//   "Tab Test 1",
//   "Tab Test 2",
//   "Tab Test 3",
//   "Tab Test 4",
// ];

export const DraggableTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const [tabs, setTabs] = useState(tabLabels);
  const handleDrop = useCallback(
    (fromIndex, toIndex) => {
      const newTabs = tabs.slice();
      const [tab] = newTabs.splice(fromIndex, 1);
      if (toIndex === -1) {
        setTabs(newTabs.concat(tab));
      } else {
        // const offset = toIndex < fromIndex ? +1 : 0;
        newTabs.splice(toIndex, 0, tab);
        setTabs(newTabs);
      }
    },
    [tabs]
  );
  return (
    <div style={{ height: 300, width: 700 }}>
      <Tabstrip
        allowDragDrop
        onActiveChange={setSelectedTab}
        onMoveTab={handleDrop}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <TabPanel tabs={tabs} activeTabIndex={selectedTab} />
    </div>
  );
};
export const DraggableTabsWithOverflow = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
    "Reports",
    "Statements",
    "Administration",
    "Virtual Branch",
    "More Services",
  ]);

  const tabColours = useMemo(() => getTabColours(tabs), []);

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      const tab = tabs[fromIndex];
      const newTabs = tabs.filter((t) => t !== tab);
      console.log(`handleDrop from ${fromIndex} to ${toIndex} 
        existing tabs ${tabs.join(",")}
      `);
      if (toIndex === -1) {
        setTabs(newTabs.concat(tab));
      } else {
        // const offset = toIndex < fromIndex ? +1 : 0;
        newTabs.splice(toIndex, 0, tab);
        console.log(`new tabs ${newTabs.join(",")}`);
        setTabs(newTabs);
      }
    },
    [tabs]
  );

  const childTabs = useMemo(
    () => tabs.map((label, i) => <Tab label={label} key={i} />),
    [tabs]
  );

  return (
    <div style={{ height: 300, width: 600 }}>
      <Tabstrip
        activeTabIndex={activeTabIndex}
        allowDragDrop
        onActiveChange={setActiveTabIndex}
        onMoveTab={handleDrop}
      >
        {childTabs}
      </Tabstrip>
      <TabPanel
        colours={tabColours}
        tabs={tabs}
        activeTabIndex={activeTabIndex}
      />
    </div>
  );
};
