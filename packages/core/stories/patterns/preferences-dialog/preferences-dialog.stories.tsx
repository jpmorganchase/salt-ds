import { Meta } from "@storybook/react";
import { SyntheticEvent, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  TabstripNext,
  TabNext,
  ParentChildLayout,
} from "@salt-ds/lab";
import { Button, FlexItem, H2, StackLayout } from "@salt-ds/core";

export default {
  title: "Patterns/Preferences Dialog",
} as Meta;

export const PreferencesDialog = () => {
  const tabs = [
    "Label 1",
    "Label 2",
    "Label 3",
    "Label 4",
    "Label 5",
    "Label 6",
    "Label 7",
  ];

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const handleTabSelection = (
    event: SyntheticEvent,
    data: { value: string }
  ) => {
    setSelectedTab(data.value);
  };

  const parent = (
    <div style={{ overflowY: "auto", width: 200 }}>
      <TabstripNext
        orientation="vertical"
        align="left"
        onChange={handleTabSelection}
        value={selectedTab}
        minimumVisible={tabs.length}
      >
        {tabs.map((label) => (
          <TabNext value={label} key={label}>
            {label}
          </TabNext>
        ))}
      </TabstripNext>
    </div>
  );
  const child = (
    <div>
      <h3>{selectedTab}</h3>
      <p>
        A global leader, we deliver strategic advice and solutions, including
        capital raising, risk management, and trade finance to corporations,
        institutions and governments.
      </p>
      <p>
        A global leader, we deliver strategic advice and solutions, including
        capital raising, risk management, and trade finance to corporations,
        institutions and governments.
      </p>
      <p>
        A global leader, we deliver strategic advice and solutions, including
        capital raising, risk management, and trade finance to corporations,
        institutions and governments.
      </p>
      <p>
        A global leader, we deliver strategic advice and solutions, including
        capital raising, risk management, and trade finance to corporations,
        institutions and governments.
      </p>
      <p>
        A global leader, we deliver strategic advice and solutions, including
        capital raising, risk management, and trade finance to corporations,
        institutions and governments.
      </p>
    </div>
  );
  return (
    <Dialog style={{ width: 800 }}>
      <DialogContent>
        <H2>Preferences</H2>
        <ParentChildLayout parent={parent} child={child} gap={2} />
      </DialogContent>
      <DialogActions>
        <StackLayout
          direction={{ xs: "column", sm: "row" }}
          style={{ width: "100%" }}
          gap={1}
        >
          <FlexItem>
            <Button variant="cta" style={{ width: "100%" }}>
              Save
            </Button>
          </FlexItem>
          <FlexItem>
            <Button style={{ width: "100%" }}>Cancel</Button>
          </FlexItem>
        </StackLayout>
      </DialogActions>
    </Dialog>
  );
};
