import {
  Badge,
  Button,
  GridItem,
  GridLayout,
  StackLayout,
} from "@salt-ds/core";
import { MessageIcon, NotificationSolidIcon } from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Badge/Badge QA",
  component: Badge,
} as Meta<typeof Badge>;

export const AllExamples: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1700} {...props}>
    <GridLayout columns={20} gap={4}>
      <Badge value={9}>
        <Button>
          <NotificationSolidIcon />
        </Button>
      </Badge>
      <Badge value={200} max={99}>
        <Button>
          <NotificationSolidIcon />
        </Button>
      </Badge>
      <Badge value={"NEW"}>
        <Button>
          <MessageIcon />
        </Button>
      </Badge>
      <Badge>
        <Button>
          <NotificationSolidIcon />
        </Button>
      </Badge>
      <GridItem colSpan={7}>
        <TabsNext defaultValue="Checks">
          <TabListNext>
            <TabBar>
              <TabNext value="Checks">
                <TabNextTrigger>
                  <StackLayout direction="row" gap={1}>
                    Checks
                    <Badge value={30} />
                  </StackLayout>
                </TabNextTrigger>
              </TabNext>
            </TabBar>
          </TabListNext>
        </TabsNext>
      </GridItem>
    </GridLayout>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
