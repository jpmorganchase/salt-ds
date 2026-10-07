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

const Separator = () => <ChevronRightIcon aria-hidden />;

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
