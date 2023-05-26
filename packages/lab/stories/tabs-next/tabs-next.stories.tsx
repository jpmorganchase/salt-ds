import { TabPanel, TabsNext } from "@salt-ds/lab";
import { Text } from "@salt-ds/core";

export default {
  title: "Lab/TabsNext/TabsNext",
  component: TabsNext,
};

export const Default = () => {
  return (
    <div style={{ width: 600, maxWidth: "100%", height: 300 }}>
      <TabsNext>
        <TabPanel label="Home">
          <Text>Content for Home tab</Text>
        </TabPanel>
        <TabPanel label="Transactions">
          <Text>Content for Transactions tab</Text>
        </TabPanel>
        <TabPanel label="FX">
          <Text>Content for FX tab</Text>
        </TabPanel>
        <TabPanel label="2018 US Equity Year Ahead Outlook">
          <Text>Content for 2018 US Equity Year Ahead Outlook tab</Text>
        </TabPanel>
        <TabPanel label="Settings">
          <Text>Settings</Text>
        </TabPanel>
      </TabsNext>
    </div>
  );
};
