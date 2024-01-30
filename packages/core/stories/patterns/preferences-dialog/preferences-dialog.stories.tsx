import { Meta } from "@storybook/react";
import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  ParentChildLayout,
} from "@salt-ds/lab";
import {
  Button,
  FlexItem,
  H2,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";

export default {
  title: "Patterns/Preferences Dialog",
} as Meta;

export const PreferencesDialog = () => {
  const items = ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5"];
  const [active, setActive] = useState(items[0]);

  const parent = (
    <div style={{ overflowY: "auto", width: 200 }}>
      <nav>
        <ul>
          {items.map((item) => (
            <li key={item}>
              <NavigationItem
                active={active === item}
                href="#"
                orientation="vertical"
                onClick={(event) => {
                  // Prevent default to avoid navigation
                  event.preventDefault();
                  setActive(item);
                }}
              >
                {item}
              </NavigationItem>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
  const child = (
    <div>
      <h3>{active}</h3>
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
