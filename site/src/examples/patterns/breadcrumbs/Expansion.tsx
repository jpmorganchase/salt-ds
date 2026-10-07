import { Button, FlowLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon, OverflowMenuIcon } from "@salt-ds/icons";
import { useState } from "react";

const Separator = () => <ChevronRightIcon aria-hidden />;

export const Expansion = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout as="ul" align="center" gap={1} style={{ listStyle: "none" }}>
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Link href="#">Home</Link>
          <Separator />
        </StackLayout>
        {isExpanded ? (
          <>
            <StackLayout as="li" direction="row" gap={1} align="center">
              <Link href="#">Level 2</Link>
              <Separator />
            </StackLayout>

            <StackLayout as="li" direction="row" gap={1} align="center">
              <Link href="#">Level 3</Link>
              <Separator />
            </StackLayout>

            <StackLayout as="li" direction="row" gap={1} align="center">
              <Link href="#">Level 4</Link>
              <Separator />
            </StackLayout>

            <StackLayout as="li" direction="row" gap={1} align="center">
              <Link href="#">Level 5</Link>
            </StackLayout>
          </>
        ) : (
          <Button
            aria-label="Show all breadcrumbs"
            appearance="transparent"
            onClick={() => setIsExpanded(true)}
          >
            <OverflowMenuIcon aria-hidden />
          </Button>
        )}
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Separator />
          <Text maxRows={1}>Current level</Text>
        </StackLayout>
      </FlowLayout>
    </nav>
  );
};
