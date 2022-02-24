// @ts-nocheck
import {
  CSSProperties,
  FC,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@brandname/core";
import {
  EditableLabel,
  Link,
  Tab,
  Tabstrip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@brandname/lab";
import { AdjustableFlexbox } from "./story-components";

import "../story.css";
import "./Flexbox.css";

export default {
  title: "Lab/Tabstrip",
  component: Tabstrip,
};

const colours = [
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

const getTabColours = (tabs: string[]) =>
  tabs.reduce((map, label, i) => ({ ...map, [label]: colours[i] }), {});

interface FlexboxProps {
  style?: CSSProperties;
  height?: number;
  row?: boolean;
  width?: number;
}

const Flexbox: FC<FlexboxProps> = ({
  children,
  style,
  height = 300,
  row = false,
  width = 600,
}) => (
  <div
    className="Flexbox"
    style={{ height, width, ...style, flexDirection: row ? "row" : "column" }}
  >
    {children}
  </div>
);

const CloseTabWarningDialog = ({
  closedTab,
  onCancel,
  onClose,
  onConfirm,
  open = false,
}) => (
  <Dialog open={open} state="warning" onClose={onClose}>
    <DialogTitle onClose={onClose}>Do you want to close this tab?</DialogTitle>
    <DialogContent>
      {`Closing the tab will cause any changes made to
                '${closedTab}' to be lost.`}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} variant="cta">
        Close Tab
      </Button>
    </DialogActions>
  </Dialog>
);

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

export const DefaultTabstripStrings = ({ height }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <Flexbox height={height}>
      <Tabstrip onChange={handleTabSelection} defaultTabs={tabs} />
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}`, padding: 10 }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};

export const DefaultTabstripTabDescriptors = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = [
    { label: "Home" },
    { label: "Transactions" },
    { label: "Loans" },
    { label: "Checks" },
    { label: "Liquidity" },
  ];
  return (
    <Flexbox>
      <Tabstrip onChange={handleTabSelection} defaultTabs={tabs} />
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}`, padding: 10 }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};

export const DefaultTabstrip = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <Flexbox>
      <Tabstrip onChange={handleTabSelection}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}`, padding: 10 }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};

const tabLabels = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const DraggableTabs = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabColours = useMemo(() => getTabColours(tabLabels), []);
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
    <Flexbox>
      <Tabstrip
        allowDragDrop
        onChange={handleTabSelection}
        onMoveTab={handleDrop}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{
            borderBottom: `solid 10px ${tabColours[label]}`,
            padding: 10,
          }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};
export const DraggableTabsDropIndicator = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabColours = useMemo(() => getTabColours(tabLabels), []);
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
    <Flexbox>
      <Tabstrip
        allowDragDrop="drop-indicator"
        onChange={handleTabSelection}
        onMoveTab={handleDrop}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{
            borderBottom: `solid 10px ${tabColours[label]}`,
            padding: 10,
          }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};
export const DraggableTabsDropIndicatorWithOverflow = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
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
    <Flexbox>
      <Tabstrip
        allowDragDrop="drop-indicator"
        onChange={handleTabSelection}
        onMoveTab={handleDrop}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}`, padding: 10 }}
        >{`Content for ${label} tab`}</div>
      ))}
    </Flexbox>
  );
};

export const InitialSelectedTabTabstrip = () => {
  const [selectedTab, handleTabSelection] = useTabSelection(1);
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <Flexbox>
      <Tabstrip onChange={handleTabSelection} value={selectedTab}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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
      <Tabstrip onChange={handleTabSelection}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
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
    <Flexbox>
      <Tabstrip onChange={handleTabSelection} overflowMenu={false}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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
    <Flexbox>
      <Tabstrip centered onChange={handleTabSelection} overflowMenu={false}>
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripSecondary = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <Flexbox>
      <Tabstrip
        noBorder
        onChange={handleTabSelection}
        overflowMenu={false}
        value={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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

  const onTabShouldClose = (index) => {
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

  const handleTabSelection = (tabIndex) => {
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
    <Flexbox>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onChange={handleTabSelection}
        onCloseTab={onTabShouldClose}
        value={selectedTab}
      >
        {tabs.map(({ label, closeable }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
      {isDialogOpen && typeof closingTabIndex === "number" && (
        <CloseTabWarningDialog
          closedTab={tabs[closingTabIndex]}
          onCancel={onDialogDidClose}
          onClose={onDialogDidClose}
          onConfirm={onDidConfirmTabClose}
          open
        />
      )}
    </Flexbox>
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

  const onTabDidClose = (closingTabIndex) => {
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

  const handleTabSelection = (tabIndex) => {
    setSelectedTab(tabIndex);
  };

  return (
    <Flexbox>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onChange={handleTabSelection}
        onCloseTab={onTabDidClose}
        value={selectedTab}
      >
        {tabs.map(({ label, closeable }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

// TODO related to how we handle custom tabs
export const TabstripLink = ({ height }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Google"];

  return (
    <Flexbox height={height}>
      <Tabstrip onChange={handleTabSelection} overflowMenu={false}>
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
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const CustomTabContent = ({ height }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Google"];

  return (
    <Flexbox height={height}>
      <Tabstrip onChange={handleTabSelection} overflowMenu={false}>
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
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripControlledAddNew = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useTabSelection();
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
    <Flexbox>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onChange={setSelectedTabIndex}
        value={selectedTabIndex}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTabIndex !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripControlledAddAndDelete = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useTabSelection();
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

  const handleCloseTab = (tabIndex) => {
    newTabCount.current += 1;
    colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
    if (selectedTabIndex > tabIndex) {
      setSelectedTabIndex(selectedTabIndex - 1);
    }
  };

  return (
    <Flexbox>
      <Tabstrip
        enableAddTab
        enableCloseTab
        onAddTab={handleAddTab}
        onChange={setSelectedTabIndex}
        onCloseTab={handleCloseTab}
        value={selectedTabIndex}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTabIndex !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripAddNewWithRename = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  const newTabCount = useRef(0);
  const handleAddTab = () => {
    newTabCount.current += 1;
    setTabs((state) =>
      state.concat([
        `New Tab${newTabCount.current > 1 ? " " + newTabCount.current : ""}`,
      ])
    );
  };

  return (
    <Flexbox>
      <Tabstrip
        enableAddTab
        enableRenameTab
        onAddTab={handleAddTab}
        onChange={handleTabSelection}
        defaultValue={0}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripUncontrolledStringTabsAddNewWithRename = ({ height }) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions"];
  //TODO add confirmation dialog

  return (
    <Flexbox height={height}>
      <Tabstrip
        defaultTabs={tabs}
        enableAddTab
        enableRenameTab
        onChange={handleTabSelection}
        defaultValue={0}
      />
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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
    <Flexbox>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onChange={handleTabSelection}
        overflowMenu={false}
        value={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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
    setTabs((state) =>
      state.concat([
        `New Workspace${
          newTabCount.current > 1 ? " " + newTabCount.current : ""
        }`,
      ])
    );
  };

  return (
    <Flexbox>
      <Tabstrip
        enableAddTab
        onAddTab={handleAddTab}
        onChange={handleTabSelection}
        overflowMenu={false}
        value={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

// TODO BUG after we close from overflow
export const TabstripCloseConfigured = ({ height }) => {
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
  const handleCloseTab = (tabIndex) => {
    console.log(`deleteTab ${tabIndex}`);
    // remove the color as well, else they will appear on different tabs
    colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <Flexbox height={height}>
      <Tabstrip
        onChange={handleTabSelection}
        onCloseTab={handleCloseTab}
        value={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripCloseDeclarative = ({ height, width = 1000 }) => {
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
  const handleDeleteTab = (tabIndex) => {
    console.log(`handle delete in story`);
    // remove the color as well, else they will appear on different tabs
    colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <Flexbox height={height} width={width}>
      <Tabstrip
        onChange={handleTabSelection}
        onCloseTab={handleDeleteTab}
        value={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
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
  const handleDeleteTab = (tabIndex) => {
    // remove the color as well, else they will appear on different tabs
    colours.splice(tabIndex, 1);
    setTabs((state) => state.filter((tab, i) => i !== tabIndex));
  };

  return (
    <Flexbox>
      <Tabstrip
        onChange={handleTabSelection}
        onCloseTab={handleDeleteTab}
        value={selectedTab}
      >
        {tabs.map(({ closeable, label }) => (
          <Tab closeable={closeable} label={label} key={label} />
        ))}
      </Tabstrip>
      {tabs.map(({ label }, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const TabstripRename = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

  return (
    <Flexbox>
      <Tabstrip
        onChange={handleTabSelection}
        overflowMenu={false}
        value={selectedTab}
      >
        {tabs.map((label, i) => (
          <Tab editable label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const VerticalTabs = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];
  return (
    <Flexbox row>
      <Tabstrip onChange={handleTabSelection} orientation="vertical">
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={idx}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};

export const EditableLabelUncontrolledValueUncontrolledEditing = () => {
  const handleEnterEditMode = () => {
    console.log("handleEnterEditMode");
  };

  const handleExitEditMode = (value) => {
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
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
    </div>
  );
};

export const EditableLabelControlledValueUncontrolledEditing = () => {
  const [value, setValue] = useState("Initial value");

  const handleEnterEditMode = () => {
    console.log("handleEnterEditMode");
  };

  const handleExitEditMode = (finalValue) => {
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

  const handleExitEditMode = (value) => {
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

  const handleExitEditMode = (finalValue) => {
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
