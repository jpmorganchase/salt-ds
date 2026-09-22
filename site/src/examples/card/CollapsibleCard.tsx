import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  FlexLayout,
  H3,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const CollapsibleCard = (): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible
      onOpenChange={(_, isOpen) => setExpanded(isOpen)}
      open={expanded}
    >
      <Card style={{ maxWidth: "360px" }}>
        <CardHeader>
          <FlexLayout align="start" gap={1} justify="space-between">
            <StackLayout gap={0.5}>
              <H3>Quarterly investment report</H3>
              <Text color="secondary">Q2 2026 - Updated 16 July</Text>
            </StackLayout>
            <CollapsibleTrigger>
              <Button
                appearance="transparent"
                aria-label="Q2 2026 report highlights"
                sentiment="neutral"
              >
                {expanded ? (
                  <ChevronUpIcon aria-hidden />
                ) : (
                  <ChevronDownIcon aria-hidden />
                )}
              </Button>
            </CollapsibleTrigger>
          </FlexLayout>
        </CardHeader>
        <CardContent>
          <StackLayout gap={2}>
            <Text>
              Review portfolio performance and the market changes that affected
              this quarter.
            </Text>
            <CollapsiblePanel>
              <StackLayout gap={1}>
                <FlexLayout justify="space-between">
                  <Text color="secondary">Portfolio return</Text>
                  <Text>+4.8%</Text>
                </FlexLayout>
                <FlexLayout justify="space-between">
                  <Text color="secondary">Benchmark return</Text>
                  <Text>+3.9%</Text>
                </FlexLayout>
                <FlexLayout justify="space-between">
                  <Text color="secondary">Income generated</Text>
                  <Text>$12,450</Text>
                </FlexLayout>
                <Text color="secondary">
                  Performance is shown after fees for the period ending 30 June
                  2026.
                </Text>
              </StackLayout>
            </CollapsiblePanel>
          </StackLayout>
        </CardContent>
        <CardFooter>
          <Button>Open full report</Button>
        </CardFooter>
      </Card>
    </Collapsible>
  );
};
