import { useState } from "react";
import { Meta } from "@storybook/react";
import { Link, Button, Text, FlowLayout } from "@salt-ds/core";
import { MenuButton } from "@salt-ds/lab";
import { OverflowMenuIcon, ChevronRightIcon } from "@salt-ds/icons";

export default {
  title: "Patterns/Breadcrumbs",
} as Meta;

const Separator = () => (
  <li aria-hidden style={{ display: "flex" }}>
    <ChevronRightIcon />
  </li>
);

export const Breadcrumbs = () => {
  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout
        as="ul"
        align="center"
        gap={1}
        style={{ listStyle: "none", minHeight: "var(--salt-size-base)" }}
      >
        <li>
          <Link href="#">Home</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 2</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 3</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 4</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 5</Link>
        </li>
        <Separator />
        <li>
          <Text maxRows={1}>Current level</Text>
        </li>
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
          rowGap: 0,
        }}
      >
        <li>
          <Link href="#">Home</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 2</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 3</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 4</Link>
        </li>
        <Separator />
        <li>
          <Link href="#">Level 5</Link>
        </li>
        <Separator />
        <li>
          <Text maxRows={1}>Current level</Text>
        </li>
      </FlowLayout>
    </nav>
  );
};

export const OverflowMenu = () => {
  const initialSource = {
    menuItems: [
      { title: "Level 2" },
      { title: "Level 3" },
      { title: "Level 4" },
      { title: "Level 5" },
    ],
  };

  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout as="ul" align="center" gap={1} style={{ listStyle: "none" }}>
        <li>
          <Link href="#">Home</Link>
        </li>
        <Separator />
        <MenuButton CascadingMenuProps={{ initialSource }} hideCaret>
          <OverflowMenuIcon />
        </MenuButton>
        <Separator />
        <li>
          <Text maxRows={1}>Current level</Text>
        </li>
      </FlowLayout>
    </nav>
  );
};

export const Expansion = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav aria-label="Breadcrumb">
      <FlowLayout as="ul" align="center" gap={1} style={{ listStyle: "none" }}>
        <li>
          <Link href="#">Home</Link>
        </li>
        <Separator />
        {isExpanded ? (
          <>
            <li>
              <Link href="#">Level 2</Link>
            </li>
            <Separator />
            <li>
              <Link href="#">Level 3</Link>
            </li>
            <Separator />
            <li>
              <Link href="#">Level 4</Link>
            </li>
            <Separator />
            <li>
              <Link href="#">Level 5</Link>
            </li>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setIsExpanded(true)}>
            <OverflowMenuIcon />
          </Button>
        )}
        <Separator />
        <li>
          <Text maxRows={1}>Current level</Text>
        </li>
      </FlowLayout>
    </nav>
  );
};
