import {
  Button,
  FlowLayout,
  Link,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ChevronRightIcon, OverflowMenuIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Patterns/Breadcrumbs",
} as Meta;

const Separator = () => <ChevronRightIcon aria-hidden />;

export const Breadcrumbs = () => {
  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout
        as="ul"
        align="center"
        gap={1}
        style={{ listStyle: "none", minHeight: "var(--salt-size-base)" }}
      >
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Link href="#">Home</Link>
          <Separator />
        </StackLayout>

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
          <Separator />
        </StackLayout>

        <StackLayout as="li" direction="row" gap={1} align="center">
          <Text maxRows={1}>Current level</Text>
        </StackLayout>
      </FlowLayout>
    </nav>
  );
};

export const Wrapped = () => {
  return (
    <nav aria-label="Breadcrumb" style={{ maxWidth: 300 }}>
      <FlowLayout
        as="ul"
        align="center"
        gap={1}
        style={{
          listStyle: "none",
          minHeight: "var(--salt-size-base)",
        }}
      >
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Link href="#">Home</Link>
          <Separator />
        </StackLayout>

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
          <Separator />
        </StackLayout>

        <StackLayout as="li" direction="row" gap={1} align="center">
          <Text maxRows={1}>Current level</Text>
        </StackLayout>
      </FlowLayout>
    </nav>
  );
};

export const OverflowMenu = () => {
  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout as="ul" align="center" gap={1} style={{ listStyle: "none" }}>
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Link href="#">Home</Link>
          <Separator />
        </StackLayout>
        <Menu>
          <MenuTrigger>
            <Button appearance="transparent" aria-label="Open Menu">
              <OverflowMenuIcon aria-hidden />
            </Button>
          </MenuTrigger>
          <MenuPanel>
            <MenuItem>Level 2</MenuItem>
            <MenuItem>Level 3</MenuItem>
            <MenuItem>Level 4</MenuItem>
            <MenuItem>Level 5</MenuItem>
          </MenuPanel>
        </Menu>
        <StackLayout as="li" direction="row" gap={1} align="center">
          <Separator />
          <Text maxRows={1}>Current level</Text>
        </StackLayout>
      </FlowLayout>
    </nav>
  );
};

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
          <Button appearance="transparent" onClick={() => setIsExpanded(true)}>
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
