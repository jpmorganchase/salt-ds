import { ReactElement, useState } from "react";
import {
  Button,
  Card,
  Display3,
  H3,
  Scrim,
  Spinner,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";

export const WithChild = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <StackLayout>
      <Card style={{ position: "relative" }} variant="secondary">
        <Scrim open={open}>
          <Spinner size="medium" />
        </Scrim>
        <StackLayout gap={1}>
          <H3>Emails</H3>
          <StackLayout gap={3}>
            <StackLayout direction="row" gap={3}>
              <StackLayout gap={0}>
                <Text>Sent</Text>
                <Display3>
                  400
                  <ArrowUpIcon
                    style={{ fill: "var(--salt-status-positive-foreground)" }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{ color: "var(--salt-status-positive-foreground)" }}
                >
                  +10 (+1.23%)
                </Text>
              </StackLayout>
              <StackLayout gap={0}>
                <Text>Received</Text>
                <Display3>
                  984
                  <ArrowDownIcon
                    style={{ fill: "var(--salt-status-negative-foreground)" }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{ color: "var(--salt-status-negative-foreground)" }}
                >
                  -32 (-5.4%)
                </Text>
              </StackLayout>
            </StackLayout>
            <StackLayout direction="row" gap={3}>
              <StackLayout gap={0}>
                <Text>Open rate</Text>
                <Display3>
                  20%
                  <ArrowUpIcon
                    style={{ fill: "var(--salt-status-positive-foreground)" }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{ color: "var(--salt-status-positive-foreground)" }}
                >
                  +6.1 (+4.32%)
                </Text>
              </StackLayout>
              <StackLayout gap={0}>
                <Text>Click rate</Text>
                <Display3>
                  5%
                  <ArrowUpIcon
                    style={{ fill: "var(--salt-status-positive-foreground)" }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{ color: "var(--salt-status-positive-foreground)" }}
                >
                  +3.7 (+1.23%)
                </Text>
              </StackLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </Card>
      {!open && (
        <Button
          style={{ width: "fit-content", alignSelf: "center" }}
          onClick={handleOpen}
          variant="cta"
        >
          Show scrim
        </Button>
      )}
      {open && (
        <Button
          style={{ width: "fit-content", alignSelf: "center" }}
          onClick={handleClose}
          variant="cta"
        >
          Hide scrim
        </Button>
      )}
    </StackLayout>
  );
};
