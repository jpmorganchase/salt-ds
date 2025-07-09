import {
  Button,
  Card,
  Display3,
  H3,
  Scrim,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const FillContainer = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((old) => !old);
  };

  return (
    <StackLayout>
      <Card
        style={{ position: "relative", padding: "var(--salt-spacing-200)" }}
        variant="secondary"
      >
        <Scrim open={open} />
        <StackLayout gap={1}>
          <H3>Emails</H3>
          <StackLayout gap={3}>
            <StackLayout direction="row" gap={3}>
              <StackLayout gap={0}>
                <Text>Sent</Text>
                <Display3>
                  400
                  <ArrowUpIcon
                    style={{
                      fill: "var(--salt-sentiment-positive-foreground-informative)",
                    }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{
                    color:
                      "var(--salt-sentiment-positive-foreground-informative)",
                  }}
                >
                  +10 (+1.23%)
                </Text>
              </StackLayout>
              <StackLayout gap={0}>
                <Text>Received</Text>
                <Display3>
                  984
                  <ArrowDownIcon
                    style={{
                      fill: "var(--salt-sentiment-negative-foreground-informative)",
                    }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{
                    color:
                      "var(--salt-sentiment-negative-foreground-informative)",
                  }}
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
                    style={{
                      fill: "var(--salt-sentiment-positive-foreground-informative)",
                    }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{
                    color:
                      "var(--salt-sentiment-positive-foreground-informative)",
                  }}
                >
                  +6.1 (+4.32%)
                </Text>
              </StackLayout>
              <StackLayout gap={0}>
                <Text>Click rate</Text>
                <Display3>
                  5%
                  <ArrowUpIcon
                    style={{
                      fill: "var(--salt-sentiment-positive-foreground-informative)",
                    }}
                    size={1}
                  />
                </Display3>
                <Text
                  style={{
                    color:
                      "var(--salt-sentiment-positive-foreground-informative)",
                  }}
                >
                  +3.7 (+1.23%)
                </Text>
              </StackLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </Card>
      <Button
        style={{ width: "fit-content", alignSelf: "center" }}
        onClick={handleClick}
        sentiment="accented"
      >
        {open ? "Hide scrim" : "Show scrim"}
      </Button>
    </StackLayout>
  );
};
