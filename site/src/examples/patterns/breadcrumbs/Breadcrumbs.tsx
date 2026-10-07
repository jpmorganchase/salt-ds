import { FlowLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";

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
