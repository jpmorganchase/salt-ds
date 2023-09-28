import { useCallback, useMemo, useRef, useState } from "react";
import { StoryFn } from "@storybook/react";
import { Button, SaltProvider, Text } from "@salt-ds/core";
import { TabPanel, Tabs } from "@salt-ds/lab";
import { CloseTabWarningDialog } from "../components";

export default {
  title: "Lab/Tabs",
  component: Tabs,
};

type TabsStory = StoryFn<typeof Tabs>;

export const Default: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  return (
    <SaltProvider>
      <Tabs style={{ width: 600, height: 300 }}>
        <TabPanel label="Home" {...style}>
          <Text>Content for Home tab</Text>
        </TabPanel>
        <TabPanel label="Transactions" {...style}>
          <Text>Content for Transactions tab</Text>
        </TabPanel>
        <TabPanel label="Loans" {...style}>
          <Text>Content for Loans tab</Text>
        </TabPanel>
        <TabPanel label="Checks" {...style}>
          <Text>Content for Checks tab</Text>
        </TabPanel>
        <TabPanel label="Liquidity" {...style}>
          <Text>Content for Liquidity tab</Text>
        </TabPanel>
      </Tabs>
    </SaltProvider>
  );
};

export const Overflow: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const tabs = useMemo(
    () => [
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
    ],
    []
  );
  return (
    <SaltProvider>
      <Tabs style={{ width: 600, height: 300 }}>
        {tabs.map((label, i) => (
          <TabPanel key={i} label={label} {...style}>
            <Text>{`Content for ${label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
    </SaltProvider>
  );
};

export const WithoutOverflow: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const tabs = useMemo(
    () => [
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
    ],
    []
  );
  return (
    <SaltProvider>
      <Tabs overflowMenu={false} style={{ width: 600, height: 300 }}>
        {tabs.map((label) => (
          <TabPanel key={label} label={label} {...style}>
            <Text>{`Content for ${label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
    </SaltProvider>
  );
};

export const Centered: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  return (
    <SaltProvider>
      <Tabs centered style={{ width: 600, height: 300 }}>
        <TabPanel label="Home" {...style}>
          <Text>Content for Home tab</Text>
        </TabPanel>
        <TabPanel label="Transactions" {...style}>
          <Text>Content for Transactions tab</Text>
        </TabPanel>
        <TabPanel label="FX" {...style}>
          <Text>Content for FX tab</Text>
        </TabPanel>
        <TabPanel label="2018 US Equity Year Ahead Outlook" {...style}>
          <Text>Content for Checks tab</Text>
        </TabPanel>
      </Tabs>
    </SaltProvider>
  );
};

export const Tertiary: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  return (
    <SaltProvider>
      <Tabs variant="tertiary" style={{ width: 600, height: 300 }}>
        <TabPanel label="Home" {...style}>
          <Text>Content for Home tab</Text>
        </TabPanel>
        <TabPanel label="Transactions" {...style}>
          <Text>Content for Transactions tab</Text>
        </TabPanel>
        <TabPanel label="Loans" {...style}>
          <Text>Content for Loans tab</Text>
        </TabPanel>
        <TabPanel label="Checks" {...style}>
          <Text>Content for Checks tab</Text>
        </TabPanel>
        <TabPanel label="Liquidity" {...style}>
          <Text>Content for Liquidity tab</Text>
        </TabPanel>
      </Tabs>
    </SaltProvider>
  );
};

export const Controlled: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [closingTabIndex, setClosingTabIndex] = useState<number | undefined>(
    undefined
  );
  const [tabs, setTabs] = useState([
    { label: "Home", closeable: false },
    { label: "Transactions" },
    { label: "Loans" },
    { label: "Checks" },
    { label: "Liquidity" },
  ]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const onTabShouldClose = useCallback(
    (tabIndex: number) => {
      setIsDialogOpen(true);
      setClosingTabIndex(tabIndex);
    },
    [setClosingTabIndex, setIsDialogOpen]
  );

  const onTabDidClose = useCallback(() => {
    // This will always be true if we reach this code path, but TypeScript needs the clarification
    if (closingTabIndex !== undefined) {
      const newTabs = [...tabs];
      newTabs.splice(closingTabIndex, 1);

      let newSelectedTab = activeTabIndex;
      if (
        activeTabIndex > closingTabIndex ||
        newTabs.length === activeTabIndex
      ) {
        newSelectedTab--;
      }
      console.log(`setActiveIndex to ${newSelectedTab}`);
      setActiveTabIndex(newSelectedTab);
      setTabs(newTabs);

      tabsRef.current?.focus();
    }
  }, [activeTabIndex, closingTabIndex, tabs]);

  const onDidConfirmTabClose = () => {
    onTabDidClose();
    setIsDialogOpen(false);
    setClosingTabIndex(undefined);
  };

  const onDialogDidClose = () => {
    setIsDialogOpen(false);
  };

  const handleAddTab = () => {
    console.log(`handleAddTab`);
    const count = tabs.length;
    setTabs((state) => state.concat([{ label: `Tab ${state.length + 1}` }]));
    setActiveTabIndex(count);
  };

  return (
    <SaltProvider>
      <Tabs
        activeTabIndex={activeTabIndex}
        enableAddTab
        onActiveChange={setActiveTabIndex}
        onAddTab={handleAddTab}
        onCloseTab={onTabShouldClose}
        ref={tabsRef}
        style={{ width: 600, height: 300 }}
      >
        {tabs.map((tab) => (
          <TabPanel enableClose key={tab.label} label={tab.label} {...style}>
            <Text>{`Content for ${tab.label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
      {isDialogOpen && typeof closingTabIndex === "number" && (
        <CloseTabWarningDialog
          closedTab={tabs[closingTabIndex]}
          onCancel={onDialogDidClose}
          onClose={onDialogDidClose}
          onConfirm={onDidConfirmTabClose}
          open
        />
      )}
    </SaltProvider>
  );
};

export const AddNew: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleAddTab = () => {
    const count = tabs.length;
    setTabs((state) => state.concat([`Tab ${state.length + 1}`]));
    setActiveTabIndex(count);
  };

  return (
    <SaltProvider>
      <Tabs
        activeTabIndex={activeTabIndex}
        enableAddTab
        onActiveChange={setActiveTabIndex}
        onAddTab={handleAddTab}
        ref={tabsRef}
        style={{ width: 600, height: 300 }}
      >
        {tabs.map((label) => (
          <TabPanel key={label} label={label} {...style}>
            <Text>{`Content for ${label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
    </SaltProvider>
  );
};

export const AddNewNoFocus: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [closingTabIndex, setClosingTabIndex] = useState<number | undefined>(
    undefined
  );
  const [tabs, setTabs] = useState([
    { label: "Home" },
    { label: "Checks" },
    { label: "Liquidity" },
  ]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const onTabShouldClose = useCallback(
    (tabIndex: number) => {
      setIsDialogOpen(true);
      setClosingTabIndex(tabIndex);
    },
    [setClosingTabIndex, setIsDialogOpen]
  );

  const onTabDidClose = useCallback(() => {
    // This will always be true if we reach this code path, but TypeScript needs the clarification
    if (closingTabIndex !== undefined) {
      const newTabs = [...tabs];
      newTabs.splice(closingTabIndex, 1);

      let newSelectedTab = activeTabIndex;
      if (
        activeTabIndex > closingTabIndex ||
        newTabs.length === activeTabIndex
      ) {
        newSelectedTab--;
      }
      setActiveTabIndex(newSelectedTab);
      setTabs(newTabs);

      tabsRef.current?.focus();
    }
  }, [activeTabIndex, closingTabIndex, tabs]);

  const onDidConfirmTabClose = () => {
    onTabDidClose();
    setIsDialogOpen(false);
    setClosingTabIndex(undefined);
  };

  const onDialogDidClose = () => {
    setIsDialogOpen(false);
  };

  const handleAddTab = () => {
    setTabs((state) => state.concat([{ label: `My Tab` }]));
  };

  return (
    <SaltProvider>
      <Button onClick={handleAddTab}>Add Tab</Button>
      <Tabs
        onCloseTab={onTabShouldClose}
        ref={tabsRef}
        style={{ width: 600, height: 300 }}
      >
        {tabs.map((tab) => (
          <TabPanel enableClose key={tab.label} label={tab.label} {...style}>
            <Text>{`Content for ${tab.label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
      {isDialogOpen && typeof closingTabIndex === "number" && (
        <CloseTabWarningDialog
          closedTab={tabs[closingTabIndex]}
          onCancel={onDialogDidClose}
          onClose={onDialogDidClose}
          onConfirm={onDidConfirmTabClose}
          open
        />
      )}
    </SaltProvider>
  );
};

export const AddNewWithRename: TabsStory = () => {
  const style = useMemo(() => ({ style: { paddingTop: 20 } }), []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [tabs, setTabs] = useState(["Home", "Transactions"]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleAddTab = () => {
    const count = tabs.length;
    setTabs((state) => state.concat([`Tab ${state.length + 1}`]));
    setActiveTabIndex(count);
    setEditing(true);
  };

  const handleEnterEditMode = () => {
    console.log("ENTER edit mode");
    setEditing(true);
  };

  const handleExitEditMode = () => {
    console.log("EXIT edit mode");
    setEditing(false);
  };

  return (
    <SaltProvider>
      <Tabs
        activeTabIndex={activeTabIndex}
        editing={editing}
        enableAddTab
        enableRenameTab
        onActiveChange={setActiveTabIndex}
        onAddTab={handleAddTab}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
        ref={tabsRef}
        style={{ width: 600, height: 300 }}
      >
        {tabs.map((label) => (
          <TabPanel key={label} label={label} {...style}>
            <Text>{`Content for ${label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
    </SaltProvider>
  );
};

export const Close: TabsStory = () => {
  const style = useMemo(() => ({ style: { padding: "20px 0" } }), []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const initialTabs = useMemo(
    () => [
      { label: "Home" },
      { label: "Transactions" },
      { label: "Loans", enableClose: true },
      { label: "Checks", enableClose: true },
      { label: "Liquidity", enableClose: true },
      { label: "Reports", enableClose: true },
      { label: "Statements", enableClose: true },
      { label: "Administration", enableClose: true },
      { label: "Virtual Branch", enableClose: true },
      { label: "More Services", enableClose: true },
    ],

    []
  );
  const [tabs, setTabs] = useState(initialTabs);

  const tabsRef = useRef<HTMLDivElement>(null);

  const handleCloseTab = useCallback(
    (tabIndex: number) => {
      if (tabIndex !== undefined) {
        const newTabs = tabs.slice();
        newTabs.splice(tabIndex, 1);
        setTabs(newTabs);

        if (tabIndex <= activeTabIndex) {
          let newSelectedTab = activeTabIndex;
          if (activeTabIndex > tabIndex || newTabs.length === activeTabIndex) {
            newSelectedTab--;
          }
          setActiveTabIndex(newSelectedTab);
        }
      }
    },
    [activeTabIndex, tabs]
  );

  const resetTabs = () => setTabs(initialTabs);

  return (
    <SaltProvider>
      <Tabs
        activeTabIndex={activeTabIndex}
        onActiveChange={setActiveTabIndex}
        onCloseTab={handleCloseTab}
        ref={tabsRef}
        style={{ width: 600 }}
      >
        {tabs.map(({ label, enableClose }) => (
          <TabPanel
            enableClose={enableClose}
            key={label}
            label={label}
            {...style}
          >
            <Text>{`Content for ${label} tab`}</Text>
          </TabPanel>
        ))}
      </Tabs>
      <Button onClick={resetTabs} disabled={tabs === initialTabs}>
        Reset
      </Button>
    </SaltProvider>
  );
};
