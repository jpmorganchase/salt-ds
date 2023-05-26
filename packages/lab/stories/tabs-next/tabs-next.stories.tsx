import { TabPanelNext, TabsNext } from "@salt-ds/lab";
import { Text } from "@salt-ds/core";

export default {
  title: "Lab/TabsNext/TabsNext",
  component: TabsNext,
};

export const Default = () => {
  return (
    <div style={{ width: 600, maxWidth: "100%", height: 300 }}>
      <TabsNext>
        <TabPanelNext label="Home">
          <Text>Content for Home tab</Text>
        </TabPanelNext>
        <TabPanelNext label="Transactions">
          <Text>Content for Transactions tab</Text>
        </TabPanelNext>
        <TabPanelNext label="FX">
          <Text>Content for FX tab</Text>
        </TabPanelNext>
        <TabPanelNext label="2018 US Equity Year Ahead Outlook">
          <Text>Content for 2018 US Equity Year Ahead Outlook tab</Text>
        </TabPanelNext>
        <TabPanelNext label="Settings">
          <Text>Settings</Text>
        </TabPanelNext>
      </TabsNext>
    </div>
  );
};

export const WithSecondaryContainer = () => {
  return (
    <div
      style={{
        width: 600,
        maxWidth: "100%",
        height: 300,
        background: "var(--salt-container-secondary-background)",
      }}
    >
      <TabsNext>
        <TabPanelNext label="Home">
          <Text>Content for Home tab</Text>
        </TabPanelNext>
        <TabPanelNext label="Transactions">
          <Text>Content for Transactions tab</Text>
        </TabPanelNext>
        <TabPanelNext label="FX">
          <Text>Content for FX tab</Text>
        </TabPanelNext>
        <TabPanelNext label="2018 US Equity Year Ahead Outlook">
          <Text>Content for 2018 US Equity Year Ahead Outlook tab</Text>
        </TabPanelNext>
        <TabPanelNext label="Settings">
          <Text>Settings</Text>
        </TabPanelNext>
      </TabsNext>
    </div>
  );
};
